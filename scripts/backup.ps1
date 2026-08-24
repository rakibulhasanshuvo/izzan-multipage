# Encrypted backup script for Windows (PowerShell)
# Backs up the PostgreSQL database (via docker exec) and the uploads volume.
# Requires BACKUP_PASSPHRASE environment variable (backups contain customer PII)
if (-not $env:BACKUP_PASSPHRASE) {
    Write-Host "Error: BACKUP_PASSPHRASE environment variable is not set." -ForegroundColor Red
    exit 1
}

$BackupDir = ".\backups"
$UploadsDir = ".\public\uploads"
$RetentionDays = 7
$PostgresContainer = if ($env:POSTGRES_CONTAINER) { $env:POSTGRES_CONTAINER } else { "izzan-postgres" }
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "izzan" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "izzan" }
$PostgresHost = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { "127.0.0.1" }
$PostgresPort = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5432" }

# Create backup directory if it doesn't exist
if (-not (Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Generate timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Filenames
# Note: dumps are stored uncompressed (pg_dump writes its own file); encryption
# happens afterwards. Avoids piping binary through PowerShell's text pipeline,
# which silently corrupts SQL dumps on Windows PowerShell 5.1.
$DumpName = "izzan_db_$Timestamp.sql"
$DumpPath = Join-Path -Path $BackupDir -ChildPath $DumpName
$DumpEncryptedPath = "$DumpPath.enc"
$ArchiveName = "izzan_uploads_$Timestamp.tar.gz"
$ArchivePath = Join-Path -Path $BackupDir -ChildPath $ArchiveName
$ArchiveEncryptedPath = "$ArchivePath.enc"

Write-Host "Starting encrypted backup of izzan application volumes..."
Write-Host "Timestamp: $Timestamp"

if (-not (Test-Path -Path $UploadsDir)) {
    Write-Host "Warning: Uploads directory $UploadsDir not found." -ForegroundColor Yellow
}

# Shared PBKDF2 + AES-CBC OpenSSL-compatible encryption helper
function Encrypt-File {
    param([string]$InPath, [string]$OutPath)
    $passbytes = [Text.Encoding]::UTF8.GetBytes($env:BACKUP_PASSPHRASE)
    $salt = New-Object byte[] 16
    [Security.Cryptography.RandomNumberGenerator]::Fill($salt)

    # Derive a 32-byte key + 16-byte IV via PBKDF2-SHA256 (200k iterations).
    # SHA-256 matches `openssl enc -pbkdf2` (its default digest), so archives
    # encrypted here decrypt with the documented openssl restore command and
    # vice versa. The 3-arg ctor would default to SHA-1 and break that.
    $derive = New-Object Security.Cryptography.Rfc2898DeriveBytes($passbytes, $salt, 200000, [Security.Cryptography.HashAlgorithmName]::SHA256)
    $key = $derive.GetBytes(32)
    $iv  = $derive.GetBytes(16)

    $aes = [Security.Cryptography.Aes]::Create()
    $aes.Mode = [Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $key
    $aes.IV = $iv

    $inStream  = [IO.File]::OpenRead($InPath)
    $outStream = [IO.File]::Create($OutPath)
    # OpenSSL "Salted__" header + salt so `openssl enc -d` can decrypt this file
    $outStream.Write([Text.Encoding]::ASCII.GetBytes("Salted__"), 0, 8)
    $outStream.Write($salt, 0, $salt.Length)

    $encryptor = $aes.CreateEncryptor()
    $cryptoStream = New-Object Security.Cryptography.CryptoStream($outStream, $encryptor, [Security.Cryptography.CryptoStreamMode]::Write)
    $inStream.CopyTo($cryptoStream)
    $cryptoStream.FlushFinalBlock()

    $cryptoStream.Dispose(); $inStream.Dispose(); $outStream.Dispose(); $aes.Dispose()
}

# Database: pg_dump writes straight to a file (never through PowerShell's
# text pipeline, which corrupts binary streams on Windows PowerShell 5.1).
# Source: the Docker container when it is running, else a host-local pg_dump.
$containerRunning = $false
try {
    docker ps --format '{{.Names}}' 2>$null | ForEach-Object {
        if ($_ -eq $PostgresContainer) { $containerRunning = $true }
    }
} catch { }

if ($containerRunning) {
    Write-Host "Dump source: Docker container '$PostgresContainer'"
    docker exec $PostgresContainer pg_dump -U $PostgresUser -f /tmp/izzan_backup.sql $PostgresDb
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: pg_dump failed inside the container." -ForegroundColor Red
        exit 1
    }
    docker cp "${PostgresContainer}:/tmp/izzan_backup.sql" (Resolve-Path $BackupDir).Path
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: could not copy dump out of the container." -ForegroundColor Red
        exit 1
    }
    Move-Item -Path (Join-Path $BackupDir "izzan_backup.sql") -Destination $DumpPath -Force
    docker exec $PostgresContainer rm /tmp/izzan_backup.sql | Out-Null
} elseif (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    Write-Host "Docker container not found — using host pg_dump at ${PostgresHost}:${PostgresPort}"
    if (-not $env:POSTGRES_PASSWORD) {
        Write-Host "Error: POSTGRES_PASSWORD environment variable is not set." -ForegroundColor Red
        exit 1
    }
    $env:PGPASSWORD = $env:POSTGRES_PASSWORD
    & pg_dump "-h$PostgresHost" "-p$PostgresPort" "-U$PostgresUser" "-f$DumpPath" $PostgresDb
} else {
    Write-Host "Error: Docker container '$PostgresContainer' not running and no host pg_dump found." -ForegroundColor Red
    exit 1
}
if ($LASTEXITCODE -eq 0 -and (Test-Path $DumpPath)) {
    try {
        Encrypt-File -InPath $DumpPath -OutPath $DumpEncryptedPath
        Remove-Item -Path $DumpPath -Force
        Write-Host "Encrypted database dump created: $DumpEncryptedPath" -ForegroundColor Green
    } catch {
        Write-Host "Error: Database dump encryption failed: $_" -ForegroundColor Red
        Remove-Item -Path $DumpPath, $DumpEncryptedPath -Force -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    Write-Host "Error: Database backup failed!" -ForegroundColor Red
    Remove-Item -Path $DumpPath -Force -ErrorAction SilentlyContinue
    exit 1
}

# Uploads: compressed archive, then encrypt in place (AES-256-CBC + PBKDF2)
tar -czf $ArchivePath $UploadsDir

if ($LASTEXITCODE -eq 0) {
    try {
        Encrypt-File -InPath $ArchivePath -OutPath $ArchiveEncryptedPath
        Remove-Item -Path $ArchivePath -Force
        Write-Host "Encrypted uploads archive created: $ArchiveEncryptedPath" -ForegroundColor Green
    } catch {
        Write-Host "Error: Encryption failed: $_" -ForegroundColor Red
        Remove-Item -Path $ArchivePath, $ArchiveEncryptedPath -Force -ErrorAction SilentlyContinue
        exit 1
    }
} else {
    Write-Host "Error: Uploads backup failed!" -ForegroundColor Red
    Remove-Item -Path $ArchivePath -Force -ErrorAction SilentlyContinue
    exit 1
}

# Delete archives older than $RetentionDays days
Get-ChildItem -Path $BackupDir -Include "izzan_db_*.sql.enc", "izzan_uploads_*.tar.gz.enc" -Recurse |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
    Remove-Item -Force

# Restore database with (note: no gunzip — dumps are plain SQL):
# openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE `
#   -in <dump>.sql.enc | docker exec -i izzan-postgres psql -U izzan -d izzan
# (host-mode: pipe the same output into `psql -h 127.0.0.1 -U izzan -d izzan` instead)
#
# Restore uploads with:
# openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE `
#   -in <archive>.tar.gz.enc | tar -xzf -
