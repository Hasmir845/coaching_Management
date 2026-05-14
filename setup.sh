#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Coaching Management System Setup${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Setup Backend
echo -e "\n${YELLOW}Setting up Backend...${NC}"
if [ -d "backend" ]; then
    cd backend
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ .env created. Please update with your settings.${NC}"
    fi
    
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        exit 1
    fi
    
    cd ..
else
    echo -e "${RED}✗ Backend folder not found${NC}"
    exit 1
fi

# Setup Frontend
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
if [ -d "frontend" ]; then
    cd frontend
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ .env created. Please update with Firebase credentials.${NC}"
    fi
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    
    cd ..
else
    echo -e "${RED}✗ Frontend folder not found${NC}"
    exit 1
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Configure backend .env file (MongoDB URI, etc.)"
echo -e "2. Configure frontend .env file (Firebase credentials)"
echo -e "3. Start backend: cd backend && npm run dev"
echo -e "4. Start frontend: cd frontend && npm run dev"
echo -e "5. Access: http://localhost:3000\n"
