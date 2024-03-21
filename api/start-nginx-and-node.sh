#!/usr/bin/env bash

# -x : see commands
# -e : stop if subscript fails
set -x

echo "Attach API binded to env NODE_PORT:[${NODE_PORT}}]"
node index.js &

echo "Start Nginx binded to Scalingo env PORT:[${PORT}]"
bash /app/bin/run
# NGINX_EXIT_CODE=$?
# echo "${NGINX_OUTPUT}"
# echo "Nginx exited with exit code:[${NGINX_EXIT_CODE}]"

