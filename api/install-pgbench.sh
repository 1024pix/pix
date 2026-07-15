#!/bin/bash

cd /tmp
apt-get download postgresql-16
dpkg -x postgresql-16_*.deb /app/pg
export PATH=/app/pg/usr/lib/postgresql/16/bin:$PATH
export LD_LIBRARY_PATH=/app/pg/usr/lib/postgresql/16/lib:$LD_LIBRARY_PATH
