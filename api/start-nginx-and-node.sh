#!/usr/bin/env bash

# -x : see commands
set -x

echo "Attach API binded to env NODE_PORT:[${NODE_PORT}}]"
node index.js &

echo "Start Nginx binded to Scalingo env PORT:[${PORT}]"
bash /app/bin/run
