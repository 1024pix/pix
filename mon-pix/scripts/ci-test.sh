#! /bin/bash

set -eu
set -o pipefail

export COVERAGE=true

ember test | tee out.log

tap-xunit < out.log > $CIRCLE_TEST_REPORTS/junit/test-results.xml
rm -f out.log

