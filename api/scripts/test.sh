#!/bin/bash

echo START

pas=9
for i in `seq 3500 10 7680`;
do
  echo STEP
	j=$(($i+$pas))
./recompute-all-score.js http://localhost:3000 $1 $i $j |& tee -a sortieUpdateCertif.txt

done

echo FINISHED


