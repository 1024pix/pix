#!/bin/bash -e

cd api
npm i @1024pix/epreuves-components@latest

cd ../mon-pix
npm i @1024pix/epreuves-components@latest

cd ../junior
npm i @1024pix/epreuves-components@latest

cd ..
node api/src/devcomp/scripts/generate-demo-epreuve-component.js
