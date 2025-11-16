#!/bin/bash
set -e

export PGPASSWORD='password'

# Function to check if the database is ready
function db_ready() {
  pg_isready -h localhost -p 5434 -U user > /dev/null 2>&1
}

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
until db_ready; do
  sleep 1
done
echo "Database is ready."

# Check if the database exists
if psql -h localhost -p 5434 -U user -lqt | cut -d \| -f 1 | grep -qw "ml-data-platform"; then
  echo "Database 'ml-data-platform' already exists."
else
  echo "Database 'ml-data-platform' does not exist. Creating it..."
  psql -h localhost -p 5434 -U user -c "CREATE DATABASE \"ml-data-platform\";"
fi

# Push the schema to the database
echo "Pushing schema to the database..."
npm run db:push