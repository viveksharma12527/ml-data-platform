#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if Docker is installed and running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running or not installed. Please install and start Docker to continue."
  exit 1
fi

# 1. Install Dependencies
echo "Installing dependencies..."
npm install

# 2. Set Up Environment Variables
echo "Setting up environment variables..."
if [ ! -f .env ]; then
  echo "DATABASE_URL=\"postgres://user:password@localhost:5432/ml-data-platform\"" > .env
fi

# 3. Start the Database
echo "Starting the database..."
docker-compose up -d

# 4. Run the Application in Development Mode
echo "Starting the application..."
# Find and kill the process running on port 5006
if lsof -i :5006 -t >/dev/null; then
    echo "Port 5006 is in use. Killing the process..."
    lsof -i :5006 -t | xargs kill -9
fi
npm run dev