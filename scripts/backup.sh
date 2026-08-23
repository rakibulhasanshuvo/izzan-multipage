#!/bin/bash
# automated VPS volume backups script (encrypted)
set -euo pipefail

# Configuration
BACKUP_DIR="./backups"
PRISMA_DB="./prisma/dev.db"
UPLOADS_DIR="./public/uploads"
RETENTION_DAYS=7

# Encryption passphrase is mandatory — backups contain customer PII
: "${BACKUP_PASSPHRASE:?Set BACKUP_PASSPHRASE in .env}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Archive filename (encrypted)
ARCHIVE_NAME="izzan_backup_$TIMESTAMP.tar.gz.enc"

echo "Starting encrypted backup of izzan application volumes..."
echo "Timestamp: $TIMESTAMP"

# Check if source files/directories exist
if [ ! -f "$PRISMA_DB" ]; then
    echo "Warning: Database file $PRISMA_DB not found."
fi

if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Warning: Uploads directory $UPLOADS_DIR not found."
fi

# Create compressed archive, then encrypt it (AES-256-CBC, PBKDF2 key derivation)
if tar -czf - "$PRISMA_DB" "$UPLOADS_DIR" | \
   openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 \
     -pass "env:BACKUP_PASSPHRASE" -out "$BACKUP_DIR/$ARCHIVE_NAME"; then
    chmod 600 "$BACKUP_DIR/$ARCHIVE_NAME"
    echo "Encrypted backup successfully created: $BACKUP_DIR/$ARCHIVE_NAME"

    # Keep only the last 7 backups and delete older ones
    find "$BACKUP_DIR" -name "izzan_backup_*.tar.gz.enc" -type f -mtime +"$RETENTION_DAYS" -delete
    echo "Cleaned up backups older than $RETENTION_DAYS days."
else
    echo "Error: Backup failed!" >&2
    rm -f "$BACKUP_DIR/$ARCHIVE_NAME"
    exit 1
fi

# Restore with:
# openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE \
#   -in <archive>.enc | tar -xzf -
