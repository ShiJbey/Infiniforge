#This file builds weapon forge into a docker image
FROM ubuntu

# Update Repo and install blender
RUN apt-get -y update && \
apt-get install -y blender \

# Install Nodejs
RUN apt-get install python-software-properties
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs

# Move over source directories
COPY ./node /

# Move ThreeJS addon to the scripts folder for blender
COPY ./three-blender/io_three /usr/share/blender/scripts/addons/
 
# Start the server on the image
RUN cd /node && \
node index.js




