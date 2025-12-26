#!/bin/sh
# Startup script that runs migrations then starts the server

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Please configure DATABASE_URL in Railway environment variables"
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

if [ $? -ne 0 ]; then
  echo "WARNING: Migration failed, but continuing to start server..."
fi

echo "Starting server..."
node dist/index.js


