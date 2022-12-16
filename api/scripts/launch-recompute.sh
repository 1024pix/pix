#!/bin/bash

echo START

list="24 25 26 27"

pas=9
for i in $list;
do
  echo STEP
	j=$(($i+$pas))
./recompute-all-score.js http://localhost:3000 $1 $i $i

done

echo FINISHED


