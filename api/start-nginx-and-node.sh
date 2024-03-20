#!/bin/bash

echo "SCALINGO PORT: ${PORT}"
echo "NODE PORT: ${NODE_PORT}"

# Démarrer Nginx en arrière-plan
nginx -g "daemon off;" &

# Démarrer Node.js
exec node index.js
