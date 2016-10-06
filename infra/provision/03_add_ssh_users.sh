#! /bin/bash

for key_path in ./install/keys/*.pub
do
	key_name=`basename $key_path`
	dokku ssh-keys:add $key_name $key_path
done
