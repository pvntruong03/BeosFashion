@echo off
title BEO Fashion Backend (Spring Boot)
cd /d "%~dp0backend"
echo ========================================================
echo Starting BEO Fashion Spring Boot Backend on :8080
echo ========================================================
mvnw.cmd spring-boot:run
pause
