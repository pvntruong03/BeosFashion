# UNIQLO E-Commerce PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Launching UNIQLO E-Commerce Fullstack Platform..." -ForegroundColor Green
Write-Host " Backend:  http://localhost:8080 (Swagger: /swagger-ui.html)" -ForegroundColor Yellow
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; .\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; npm run dev"

Write-Host "Both Backend and Frontend have been launched in background PowerShell windows!" -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your web browser." -ForegroundColor White
