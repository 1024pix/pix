#!/bin/bash

echo "nothing to do"
# notify succeeded deployment
curl -X POST --location "$NOTIFY_URL" \
    -H "Content-Type: application/json" \
    -d '{
          "app-name": "$APP_NAME",
          "environment": "$ENVIRONMENT",
          "version": "v$npm pkg get version"
        }'
