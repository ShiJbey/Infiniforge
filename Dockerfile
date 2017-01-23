#This file builds weapon forge into a docker image
FROM ubuntu

RUN apt-get -y update && \
apt-get install -y blender

