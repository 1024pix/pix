#!/bin/bash

# Démarrer Nginx en arrière-plan
nginx -g "daemon off;" &

# Démarrer Node.js
exec node index.js