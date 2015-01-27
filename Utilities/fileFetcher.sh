#! /bin/bash
#
#// :Author: //#
# Ryan Berg #
# rberg2@hotmail.com #
#
# Created on 1/25/15
#
#// :Purpose: //#
#  download files from google drive#
#
#TODO: inform of overwrite

FILE_URL="null" #google drive download url
FILE_NAME="error.txt"

echo which file would you like to fetch? [proxy, interpreter, server, director]
read FILE_TYPE

if [ "$FILE_TYPE" == "proxy" ]; then

    FILE_URL="https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVWTlZREJVWUFqNEE"
    FILE_NAME="proxy.js"

    echo would you like to download phantomRequest.js too? [y, n]
    read RESPONSE

    if [ "$RESPONSE" == "y" ]; then
        curl -L "https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVbjljM2hTMHJaSXM" > phantomRequest.js
    fi

elif [ "$FILE_TYPE" == "interpreter" ]; then
    FILE_URL="https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVb3pWYmp6R1dsRms"
    FILE_NAME="htmlInterpreter.js"

elif [ "$FILE_TYPE" == "server" ]; then
    FILE_URL="https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVWHl0M3dVOGtFX1U"
    FILE_NAME="server.js"

elif [ "$FILE_TYPE" == "director" ]; then
    FILE_URL="https://drive.google.com/uc?export=download&id=0B6jk8rzz3GfVOWFoYjZrR2hSZmc"
    FILE_NAME="mainDirector.js"

else
    echo "No valid argument passed."

fi

curl -L "$FILE_URL" > "$FILE_NAME"