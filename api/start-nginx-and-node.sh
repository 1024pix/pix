#!/bin/bash
set -euo pipefail;

# Démarrer Nginx en arrière-plan
nginx -g "daemon off;" &

# Démarrer Node.js
exec node index.js
