#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if Docker is installed and running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running or not installed. Please install and start Docker to continue."
  exit 1
fi

# Stop the database container
echo "Stopping the database..."
docker-compose down

# Stop the application
echo "Stopping the application..."
if lsof -ti:5006 >/dev/null; then
    lsof -ti:5006 | xargs kill
    echo "Application stopped."
else
    echo "Application is not running."
fi