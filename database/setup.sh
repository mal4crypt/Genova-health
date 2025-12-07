#!/bin/bash

# Genova Health - Database Setup Script
# This script sets up PostgreSQL database with all required tables and seed data

set -e

echo "🏥 Genova Health - Database Setup"
echo "=================================="

# Configuration
DB_NAME="genova_health"
DB_USER="genova_admin"
DB_PASSWORD="genova_secure_2024"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Install with: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Check if running as postgres user or sudo
if [ "$EUID" -eq 0 ]; then
    PG_USER="postgres"
else
    PG_USER=$(whoami)
fi

echo ""
echo "📊 Creating database and user..."

# Create database user and database
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database and user created${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

echo ""
echo "📋 Running migrations..."

# Run schema migration
PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -d ${DB_NAME} -f database/schema.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema created${NC}"
else
    echo -e "${RED}❌ Schema creation failed${NC}"
    exit 1
fi

# Run additional features migration
PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -d ${DB_NAME} -f database/migrations/add_admin_features.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin features migration completed${NC}"
else
    echo -e "${RED}❌ Admin features migration failed${NC}"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."

# Seed admin users
PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -d ${DB_NAME} -f database/seeds/admin_seed.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin users seeded${NC}"
else
    echo -e "${YELLOW}⚠ Admin seed warning (may already exist)${NC}"
fi

# Seed sample data if files exist
if [ -f "database/seeds/sample_patients.sql" ]; then
    PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -d ${DB_NAME} -f database/seeds/sample_patients.sql
    echo -e "${GREEN}✓ Sample patients seeded${NC}"
fi

if [ -f "database/seeds/sample_doctors.sql" ]; then
    PGPASSWORD=${DB_PASSWORD} psql -U ${DB_USER} -d ${DB_NAME} -f database/seeds/sample_doctors.sql
    echo -e "${GREEN}✓ Sample doctors seeded${NC}"
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection Details:"
echo "-------------------"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASSWORD}"
echo "Host: localhost"
echo "Port: 5432"
echo ""
echo "Update your backend/.env file with:"
echo "DB_USER=${DB_USER}"
echo "DB_PASSWORD=${DB_PASSWORD}"
echo "DB_NAME=${DB_NAME}"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo ""
echo "Admin Accounts Created:"
echo "1. mal4crypt404@gmail.com (Password: Admin@123)"
echo "2. nelsonshinaayomi209@gmail.com (Password: Admin@123)"
echo ""
echo -e "${GREEN}🎉 Ready to start backend server!${NC}"
