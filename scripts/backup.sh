#!/bin/bash
# automated VPS volume backups script

# Configuration
BACKUP_DIR="./backups"
PRISMA_DB="./prisma/dev.db"
UPLOADS_DIR="./public/uploads"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Archive filename
ARCHIVE_NAME="izzan_backup_$TIMESTAMP.tar.gz"

echo "Starting backup of izzan application volumes..."
echo "Timestamp: $TIMESTAMP"

# Check if source files/directories exist
if [ ! -f "$PRISMA_DB" ]; then
    echo "Warning: Database file $PRISMA_DB not found."
fi

if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Warning: Uploads directory $UPLOADS_DIR not found."
fi

# Create compressed archive
tar -czvf "$BACKUP_DIR/$ARCHIVE_NAME" "$PRISMA_DB" "$UPLOADS_DIR"

# Check if archive creation was successful
if [ $? -eq 0 ]; then
    echo "Backup successfully created: $BACKUP_DIR/$ARCHIVE_NAME"
    
    # Optional: Keep only the last 7 backups and delete older ones
    # find "$BACKUP_DIR" -name "izzan_backup_*.tar.gz" -type f -mtime +7 -delete
    # echo "Cleaned up backups older than 7 days."
else
    echo "Error: Backup failed!"
    exit 1
fi
