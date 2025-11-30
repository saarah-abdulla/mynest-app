#!/bin/sh
# Script to generate Prisma client with fallback paths

if [ -f ../prisma/schema.prisma ]; then
  echo "Found schema at ../prisma/schema.prisma"
  npx prisma generate --schema=../prisma/schema.prisma
elif [ -f ../../prisma/schema.prisma ]; then
  echo "Found schema at ../../prisma/schema.prisma"
  npx prisma generate --schema=../../prisma/schema.prisma
elif [ -f prisma/schema.prisma ]; then
  echo "Found schema at prisma/schema.prisma"
  npx prisma generate --schema=prisma/schema.prisma
else
  echo "ERROR: Could not find Prisma schema file"
  echo "Current directory: $(pwd)"
  echo "Listing parent directory:"
  ls -la .. || true
  exit 1
fi

