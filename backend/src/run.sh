#!/bin/sh

dir=`dirname $0`
cd $dir

# calc and write rsam
python3 ./rsam.py $1

# create images
python3 ./make_image.py $1

