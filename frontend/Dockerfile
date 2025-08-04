# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:lts-alpine

# Accept build-time environment variables
ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL

# Create and change to the app directory.
WORKDIR /app

# Copy the files to the container image
COPY package*.json ./

# Install packages
RUN npm ci

# Copy local code to the container image.
COPY . ./

# Build the app.
RUN npm run build

# Serve the app using preview script
CMD ["npm", "run", "preview"]