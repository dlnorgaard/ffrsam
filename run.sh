#!/bin/sh

dir=`dirname $0`
cd $dir

# clean up old logs
find ./log/ -mtime +14 -exec rm {} \;

# calc and write rsam
PYTHON_HOME=/opt/anaconda3/envs/rsam/
$PYTHON_HOME/bin/python ./rsam.py $1

