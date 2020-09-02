#!/usr/bin/env bash
alteredFilePaths=$(git ls-files -m '*.js');
files=$@

function lint () {
  npx eslint $alteredFilePaths --fix
}

function test () {
  npm run test:api:path $files -- --bail
}

function commit () {
  echo "TCR => COMMIT"
  git commit -am "TCR:WIP"
}

function revert () {
  echo "TCR => REVERT"
  git checkout HEAD lib/
}

if [ ! -z "$alteredFilePaths" ] ; then
  if lint ; then
    test && commit || revert
  else
    echo "TCR => ABORT"
  fi
else
  echo "TCR => NOTHING HAS CHANGED"
fi
