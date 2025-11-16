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
echo "DATABASE_URL=\"postgres://user:password@localhost:5434/ml-data-platform\"" > .env
source .env

# 3. Start the Database
echo "Starting the database..."
docker-compose down
docker-compose up -d

# 4. Initialize the database
./init-db.sh

# 5. Run the Application in Development Mode
echo "Starting the application..."
# Check if the application is already running
if lsof -i :5006 -t >/dev/null; then
    echo "Application is already running on port 5006."
else
    npm run dev
fi