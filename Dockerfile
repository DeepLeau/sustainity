# Used to build the image
FROM node:18-alpine

# Working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Installing dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Listening port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]