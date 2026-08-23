# Encrypted backup script for Windows (PowerShell)
# Requires BACKUP_PASSPHRASE environment variable (backups contain customer PII)
if (-not $env:BACKUP_PASSPHRASE) {
    Write-Host "Error: BACKUP_PASSPHRASE environment variable is not set." -ForegroundColor Red
    exit 1
}

$BackupDir = ".\backups"
$PrismaDB = ".\prisma\dev.db"
$UploadsDir = ".\public\uploads"
$RetentionDays = 7

# Create backup directory if it doesn't exist
if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Archive filenames
$ArchiveName = "izzan_backup_$Timestamp.tar.gz"
$ArchivePath = Join-Path -Path $BackupDir -ChildPath $ArchiveName
$EncryptedPath = "$ArchivePath.enc"

Write-Host "Starting encrypted backup of izzan application volumes..."
Write-Host "Timestamp: $Timestamp"

# Check if source files/directories exist
if (-not (Test-Path -Path $PrismaDB)) {
    Write-Host "Warning: Database file $PrismaDB not found." -ForegroundColor Yellow
}

if (-not (Test-Path -Path $UploadsDir)) {
    Write-Host "Warning: Uploads directory $UploadsDir not found." -ForegroundColor Yellow
}

# Create compressed archive
tar -czf $ArchivePath $PrismaDB $UploadsDir

# Check if archive creation was successful, then encrypt in place (AES-256-CBC + PBKDF2)
if ($LASTEXITCODE -eq 0) {
    try {
        $passbytes = [Text.Encoding]::UTF8.GetBytes($env:BACKUP_PASSPHRASE)
        $salt = New-Object byte[] 16
        [Security.Cryptography.RandomNumberGenerator]::Fill($salt)

        # Derive a 32-byte key + 16-byte IV via PBKDF2 (matches openssl defaults for digest)
        $derive = New-Object Security.Cryptography.Rfc2898DeriveBytes($passbytes, $salt, 200000)
        $key = $derive.GetBytes(32)
        $iv  = $derive.GetBytes(16)

        $aes = [Security.Cryptography.Aes]::Create()
        $aes.Mode = [Security.Cryptography.CipherMode]::CBC
        $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
        $aes.Key = $key
        $aes.IV = $iv

        $inStream  = [IO.File]::OpenRead($ArchivePath)
        $outStream = [IO.File]::Create($EncryptedPath)
        # OpenSSL "Salted__" header + salt so `openssl enc -d` can decrypt this file
        $outStream.Write([Text.Encoding]::ASCII.GetBytes("Salted__"), 0, 8)
        $outStream.Write($salt, 0, $salt.Length)

        $encryptor = $aes.CreateEncryptor()
        $cryptoStream = New-Object Security.Cryptography.CryptoStream($outStream, $encryptor, [Security.Cryptography.CryptoStreamMode]::Write)
        $inStream.CopyTo($cryptoStream)
        $cryptoStream.FlushFinalBlock()

        $cryptoStream.Dispose(); $inStream.Dispose(); $outStream.Dispose(); $aes.Dispose()
        Remove-Item -Path $ArchivePath -Force
        Write-Host "Encrypted backup successfully created: $EncryptedPath" -ForegroundColor Green
    } catch {
        Write-Host "Error: Encryption failed: $_" -ForegroundColor Red
        Remove-Item -Path $ArchivePath, $EncryptedPath -Force -ErrorAction SilentlyContinue
        exit 1
    }

    # Keep only the last 7 backups and delete older ones
    Get-ChildItem -Path $BackupDir -Filter "izzan_backup_*.tar.gz.enc" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
        Remove-Item -Force
} else {
    Write-Host "Error: Backup failed!" -ForegroundColor Red
    exit 1
}
