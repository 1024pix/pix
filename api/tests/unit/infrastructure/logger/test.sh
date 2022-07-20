#!/usr/bin/env bash

# early exit on failure
set -e

cd tests/unit/infrastructure/logger/scenarios
node info-for-human.js | diff info-for-human.expected -
node no-log.js | diff no-log.expected -
