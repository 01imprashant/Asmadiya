# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript (if you want to run compiled JS)
# RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the app (using ts-node for dev, or node dist for prod)
CMD ["npx", "ts-node", "src/index.ts"]