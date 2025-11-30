#!/bin/sh
# Script to generate Prisma client
# Railway copies only the backend folder, so we need the schema in backend/

if [ -f prisma/schema.prisma ]; then
  echo "Found schema at prisma/schema.prisma"
  npx prisma generate --schema=prisma/schema.prisma
elif [ -f ../prisma/schema.prisma ]; then
  echo "Found schema at ../prisma/schema.prisma"
  npx prisma generate --schema=../prisma/schema.prisma
else
  echo "ERROR: Could not find Prisma schema file"
  echo "Current directory: $(pwd)"
  echo "Listing current directory:"
  ls -la || true
  echo "Looking for prisma folder:"
  find . -name "schema.prisma" 2>/dev/null || echo "No schema.prisma found"
  exit 1
fi

