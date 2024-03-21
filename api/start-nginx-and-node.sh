#!/usr/bin/env bash
set -x

echo "SCALINGO PORT: ${PORT}"

pwd
ls /app/bin/

# Démarrer Node.js
echo "Start API binded to env NODE_PORT:[${NODE_PORT}}]"
node index.js &

# Start Nginx
echo "Start Nginx binded to Scalingo env PORT:[${PORT}]"
exec /app/bin/run
