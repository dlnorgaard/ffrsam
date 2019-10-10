#!/bin/sh

dir=`dirname $0`
cd $dir

# calc and write rsam
PYTHON_HOME=/opt/anaconda3/envs/rsam/
$PYTHON_HOME/bin/python ./back_populate.py 

