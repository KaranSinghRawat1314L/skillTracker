# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build your frontend (Vite)
RUN npm run build

# Production image, using nginx to serve built frontend
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
