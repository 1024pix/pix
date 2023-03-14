#!/usr/bin/env bash

if [ "$START_JOB_IN_WEB_PROCESS" = "true" ]; then
  echo "starting worker and web"
  node worker.js & node index.js
else
  echo "starting web only"
  node index.js
fi
