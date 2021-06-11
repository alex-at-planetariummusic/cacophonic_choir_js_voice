#!/bin/sh

mkdir processed

for file in *.wav;
do 
  sox $file processed/$(basename $file) norm -1 silence 1 0.05 1% reverse silence 1 0.05 1% fade p 0.01 reverse fade p 0.01
done
