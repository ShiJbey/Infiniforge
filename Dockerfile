#This file builds weapon forge into a docker image
FROM ubuntu

# Update Repo and install blender
RUN apt-get -y update && apt-get install -y \
blender \
python-software-properties \
curl \
sudo

# Install Nodejs
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs

# Move over source directories
COPY node/ /node/

# Move ThreeJS addon to the scripts folder for blender
COPY three-blender/io_three /usr/share/blender/scripts/addons/io_three/

# Exposes port 8080
EXPOSE 8080
 
# Change to node directory
CMD cd /node && node index.js 




