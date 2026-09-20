#!/usr/bin/env pwsh
# LANDSTACK Database Setup Script
# Run this script to create the database and apply all migrations
# Usage: .\scripts\setup-database.ps1

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "landstack",
    [string]$DbUser = "postgres",
    [string]$DbPassword = ""
)

$PSQL = "D:\PostgreSQL manager\bin\psql.exe"

if ($DbPassword -eq "") {
    $DbPassword = Read-Host -Prompt "Enter PostgreSQL password for user '$DbUser'" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
    )
}

$env:PGPASSWORD = $DbPassword

Write-Host "=== LANDSTACK Database Setup ===" -ForegroundColor Cyan
Write-Host "Host: $DbHost | Port: $DbPort | DB: $DbName | User: $DbUser"
Write-Host ""

# Step 1: Create database
Write-Host "Step 1: Creating database '$DbName'..." -ForegroundColor Yellow
& $PSQL -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName;" 2>&1
Write-Host "Database created (or already exists)." -ForegroundColor Green

# Step 2: Run migrations
$migrations = @(
    "database\migrations\001_create_extensions.sql",
    "database\migrations\002_create_schema.sql",
    "database\migrations\003_synthetic_seeds.sql"
)

foreach ($migration in $migrations) {
    $migPath = Join-Path (Split-Path -Parent $PSScriptRoot) $migration
    Write-Host ""
    Write-Host "Running: $migration" -ForegroundColor Yellow
    & $PSQL -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $migPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Success" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Database setup complete! ===" -ForegroundColor Cyan
Write-Host "Database '$DbName' is ready with synthetic data." -ForegroundColor Green
Write-Host ""
Write-Host "Verify with:"
Write-Host "  & '$PSQL' -h $DbHost -U $DbUser -d $DbName -c 'SELECT COUNT(*) FROM parcels;'"
