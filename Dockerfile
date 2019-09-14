#This file builds Infiniforge into a NodeJS docker image
FROM node:12.10.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy over app source
ADD . .

# Exposes port 8080
EXPOSE 8080

# Build the project
RUN npm run-script build

# Start the server
CMD ["npm", "start"]

