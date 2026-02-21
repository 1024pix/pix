#!/usr/bin/env bash

kubectl scale -n pix --replicas 0 deployment api

cd api/
npm run db:reset

kubectl scale -n pix --replicas 1 deployment api
