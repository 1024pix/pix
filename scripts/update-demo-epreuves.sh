#!/bin/bash -e

cd api
npm i @1024pix/epreuves-components@latest

cd ../mon-pix
npm i @1024pix/epreuves-components@latest

cd ../junior
npm i @1024pix/epreuves-components@latest

cd ..
# Regenerating the demo module is now done in Pix Editor, not via this script.
