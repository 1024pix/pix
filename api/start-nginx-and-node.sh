#!/usr/bin/env bash

# -x : see commands
set -x

echo "Attach API binded to env NODE_PORT:[${NODE_PORT}}]"
node index.js &

cp /app/ngx_http_redis_module.so /app/vendor/nginx/modules/ngx_http_modsecurity_module.so

sed -i '1iload_module modules/ngx_http_modsecurity_module.so;' /app/vendor/nginx/conf/nginx.conf

echo "Start Nginx binded to Scalingo env PORT:[${PORT}]"
bash /app/bin/run
