@echo off
REM Colors (Windows doesn't support ANSI, so we'll use simple formatting)
echo ================================
echo Coaching Management System Setup
echo ================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm not found
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

REM Setup Backend
echo.
echo Setting up Backend...
if not exist "backend" (
    echo Error: Backend folder not found
    pause
    exit /b 1
)

cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [OK] .env created. Please update with your settings.
)

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
if not exist "frontend" (
    echo Error: Frontend folder not found
    pause
    exit /b 1
)

cd frontend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [OK] .env created. Please update with Firebase credentials.
)

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Configure backend .env file (MongoDB URI, etc.)
echo 2. Configure frontend .env file (Firebase credentials)
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo 5. Access: http://localhost:3000
echo.
pause
