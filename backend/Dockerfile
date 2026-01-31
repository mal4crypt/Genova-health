FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including prisma for generation)
RUN npm install

# Copy prisma schema and generate client at build time
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Ensure environment port is respected
EXPOSE 5000

# Start server directly
CMD ["node", "src/index.js"]
