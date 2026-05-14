$BackupDir = ".\backups"
$PrismaDB = ".\prisma\dev.db"
$UploadsDir = ".\public\uploads"

# Create backup directory if it doesn't exist
if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Archive filename
$ArchiveName = "izzan_backup_$Timestamp.tar.gz"
$ArchivePath = Join-Path -Path $BackupDir -ChildPath $ArchiveName

Write-Host "Starting backup of izzan application volumes..."
Write-Host "Timestamp: $Timestamp"

# Check if source files/directories exist
if (-not (Test-Path -Path $PrismaDB)) {
    Write-Host "Warning: Database file $PrismaDB not found." -ForegroundColor Yellow
}

if (-not (Test-Path -Path $UploadsDir)) {
    Write-Host "Warning: Uploads directory $UploadsDir not found." -ForegroundColor Yellow
}

# Create compressed archive
tar -czvf $ArchivePath $PrismaDB $UploadsDir

# Check if archive creation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup successfully created: $ArchivePath" -ForegroundColor Green
} else {
    Write-Host "Error: Backup failed!" -ForegroundColor Red
    exit 1
}
