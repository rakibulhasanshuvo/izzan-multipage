#!/bin/bash
# automated VPS backups script (encrypted): PostgreSQL dump + uploads volume
set -euo pipefail

# Configuration
BACKUP_DIR="./backups"
UPLOADS_DIR="./public/uploads"
RETENTION_DAYS=7
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-izzan-postgres}"
POSTGRES_USER="${POSTGRES_USER:-izzan}"
POSTGRES_DB="${POSTGRES_DB:-izzan}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Load .env if present; never override variables already in the environment
if [ -f ".env" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|\#*) continue ;; esac
    key="${line%%=*}"; val="${line#*=}"
    if [ -n "$key" ] && [ -z "${!key+x}" ]; then
      export "$key=$val"
    fi
  done < .env
fi

# Encryption passphrase is mandatory — backups contain customer PII
: "${BACKUP_PASSPHRASE:?Set BACKUP_PASSPHRASE in .env}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Filenames (encrypted)
DB_DUMP_NAME="izzan_db_$TIMESTAMP.sql.gz.enc"
ARCHIVE_NAME="izzan_uploads_$TIMESTAMP.tar.gz.enc"

echo "Starting encrypted backup of izzan application volumes..."
echo "Timestamp: $TIMESTAMP"

if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Warning: Uploads directory $UPLOADS_DIR not found."
fi

# Database: stream pg_dump, compress, then encrypt
# (AES-256-CBC, PBKDF2 key derivation). No -t flag: binary-safe piping.
# Source: the Docker container when it is running, else a host-local pg_dump.
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$POSTGRES_CONTAINER"; then
    echo "Dump source: Docker container '$POSTGRES_CONTAINER'"
    DUMP_CMD=(docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB")
elif command -v pg_dump >/dev/null 2>&1; then
    echo "Docker container not found — using host pg_dump at $POSTGRES_HOST:$POSTGRES_PORT"
    export PGPASSWORD="${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}"
    DUMP_CMD=(pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB")
else
    echo "Error: Docker container '$POSTGRES_CONTAINER' not running and no host pg_dump found." >&2
    exit 1
fi

if "${DUMP_CMD[@]}" | \
   gzip | \
   openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 \
     -pass "env:BACKUP_PASSPHRASE" -out "$BACKUP_DIR/$DB_DUMP_NAME"; then
    chmod 600 "$BACKUP_DIR/$DB_DUMP_NAME"
    echo "Encrypted database dump created: $BACKUP_DIR/$DB_DUMP_NAME"
else
    echo "Error: Database backup failed!" >&2
    rm -f "$BACKUP_DIR/$DB_DUMP_NAME"
    exit 1
fi

# Uploads: compressed archive, then encrypt
if tar -czf - "$UPLOADS_DIR" | \
   openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 \
     -pass "env:BACKUP_PASSPHRASE" -out "$BACKUP_DIR/$ARCHIVE_NAME"; then
    chmod 600 "$BACKUP_DIR/$ARCHIVE_NAME"
    echo "Encrypted uploads archive created: $BACKUP_DIR/$ARCHIVE_NAME"
else
    echo "Error: Uploads backup failed!" >&2
    rm -f "$BACKUP_DIR/$ARCHIVE_NAME"
    exit 1
fi

# Keep only the last 7 of each kind and delete older ones
find "$BACKUP_DIR" \( -name "izzan_db_*.sql.gz.enc" -o -name "izzan_uploads_*.tar.gz.enc" \) \
  -type f -mtime +"$RETENTION_DAYS" -delete
echo "Cleaned up backups older than $RETENTION_DAYS days."

# Restore database with:
# openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE \
#   -in <dump>.sql.gz.enc | gunzip | docker exec -i izzan-postgres psql -U izzan -d izzan
# (host-mode: pipe the same output into `psql -h 127.0.0.1 -U izzan -d izzan` instead)
#
# Restore uploads with:
# openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE \
#   -in <archive>.tar.gz.enc | tar -xzf -
