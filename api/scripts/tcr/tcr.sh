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

if [ -n "$alteredFilePaths" ] ; then
  if lint ; then
    if test ; then commit ; else revert ; fi
  else
    echo "TCR => ABORT"
  fi
else
  echo "TCR => NOTHING HAS CHANGED"
fi
