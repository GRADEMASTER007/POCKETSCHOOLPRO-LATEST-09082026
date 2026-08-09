# =========================================================
# Stage 1: Build the React Application with Vite
# =========================================================
FROM node:20-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm ci

# Copy the rest of the application codebase
COPY . .

# Build the React application (compiles assets into the dist/ directory)
RUN npm run build

# =========================================================
# Stage 2: Serve the Static Assets using lightweight Nginx
# =========================================================
FROM nginx:alpine AS production-stage

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from build-stage to Nginx default public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 for local environment & Cloud Run ingress routing
EXPOSE 3000

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
