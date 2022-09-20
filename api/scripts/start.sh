#!/bin/bash
if [ $START_SCHEDULER ]; then
  npm run start:job&
fi
exec node index.js
