#! /bin/bash

# XXX We absolutely need to be in the app directory so that the nginx script works
cd /app
# We do the normal nginx launch command of the nginx-buildpack
/app/bin/run
