#This file builds Infiniforge into a NodeJS docker image
FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json /usr/src/app/
RUN npm Install

# Copy over app source
COPY * /usr/src/app/

# Exposes port 8080
EXPOSE 8080
CMD ["npm", "start"]

