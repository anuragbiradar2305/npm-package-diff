# Use official Node.js image as base
FROM node:22-alpine

# Set working directory
WORKDIR /diffApp

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 2305

# Start the application
CMD ["node", "server.js"]