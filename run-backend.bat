@echo off
title UNIQLO E-Commerce Backend (Spring Boot)
cd /d "%~dp0backend"
echo ========================================================
echo Starting UNIQLO E-Commerce Spring Boot Backend on :8080
echo ========================================================
mvnw.cmd spring-boot:run
pause
