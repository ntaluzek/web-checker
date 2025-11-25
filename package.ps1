# Chrome Extension Packaging Script for Web Checker
# This script creates a ZIP file ready for Chrome Web Store upload

# Get the version from manifest.json
$manifest = Get-Content -Path "manifest.json" -Raw | ConvertFrom-Json
$version = $manifest.version
$zipFileName = "web-checker-$version.zip"

Write-Host "Packaging Web Checker Extension v$version..." -ForegroundColor Cyan

# Remove existing package if it exists
if (Test-Path $zipFileName) {
    Remove-Item $zipFileName
    Write-Host "Removed existing package: $zipFileName" -ForegroundColor Yellow
}

# Files and folders to include
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "popup.css",
    "options.html",
    "options.js",
    "options.css",
    "LICENSE",
    "README.md",
    "icons"
)

# Create a temporary directory for packaging
$tempDir = "temp-package"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files to temp directory
Write-Host "Copying files..." -ForegroundColor Green
foreach ($item in $filesToInclude) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            # It's a directory
            Copy-Item -Path $item -Destination $tempDir -Recurse
            Write-Host "  + $item/" -ForegroundColor Gray
        } else {
            # It's a file
            Copy-Item -Path $item -Destination $tempDir
            Write-Host "  + $item" -ForegroundColor Gray
        }
    } else {
        Write-Host "  - $item (not found, skipping)" -ForegroundColor DarkGray
    }
}

# Create the ZIP file
Write-Host "Creating ZIP archive..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFileName -CompressionLevel Optimal

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

# Verify the package was created
if (Test-Path $zipFileName) {
    $fileSize = (Get-Item $zipFileName).Length / 1KB
    Write-Host "`nSuccess! Package created: $zipFileName" -ForegroundColor Green
    Write-Host "File size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
    Write-Host "`nThis ZIP file is ready to upload to the Chrome Web Store." -ForegroundColor White
} else {
    Write-Host "`nError: Failed to create package!" -ForegroundColor Red
    exit 1
}
