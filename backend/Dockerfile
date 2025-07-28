# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY . .

# Expose backend port (adjust if using another port)
EXPOSE 5000

# Start backend app
CMD ["npm", "start"]
