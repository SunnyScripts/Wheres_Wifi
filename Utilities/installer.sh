#! /bin/bash
#
#// :Author: \\#
# Ryan Berg #
# rberg2@hotmail.com #
# Created on 1/24/15
#
#// :Purpose: \\#
# install nodejs, npm, and phantomjs, download fileFectcher.sh
# intended for linux #
#
#// :To Use: \\#
#$ chmod +x <thisfile.name> #make executable
#$ ./<thisfile.name #execute
#
# available at: https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVTFREbmNwRmxndjQ
#
#TODO: pull from latest stable builds

echo install nodejs and npm? [y, n]
read RESPONSE
if [ "$RESPONSE" == "y" ]; then
    wget "http://nodejs.org/dist/v0.10.35/node-v0.10.35-linux-x64.tar.gz"
    tar -zxvf node-v0.10.35-linux-x64.tar.gz
    cd node-v0.10.35-linux-x64/bin
    sudo cp node /usr/bin
    cd $BACK
    sudo apt-get update
    sudo apt-get install build-essential
    cd node-v0.10.35-linux-x64/lib/node_modules/npm
    ./configure
    make
    sudo make install
    sudo npm install -g n
    sudo n latest
    sudo npm install forever -g
    cd $BACK
fi

echo install phantomjs? [y, n]
read RESPONSE
if [ "$RESPONSE" == "y" ]; then
    curl -L "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2" > phantomjs-1.9.8-linux-x86_64.tar.bz2
    bzip2 -d phantomjs-1.9.8-linux-x86_64.tar.bz2
    tar -xvf phantomjs-1.9.8-linux-x86_64.tar
    sudo apt-get install libfontconfig
    cd phantomjs-1.9.8-linux-x86_64/bin
    sudo cp phantomjs /usr/bin
    cd $BACK
fi

echo download fileFetcher.sh? [y, n]
read RESPONSE
if [ "$RESPONSE" == "y" ]; then
    curl -L "https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVVjJVUjFHQ0E2dVU" > fileFetcher.sh
    chmod +x fileFetcher.sh

    echo run fileFetcher.sh? [y, n]
    read RESPONSE
    if [ "$RESPONSE" == "y" ]; then
        ./fileFetcher.sh
    fi
fi