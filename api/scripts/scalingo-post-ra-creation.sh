#!/bin/bash

pnpm run postdeploy
pnpm run db:seed
