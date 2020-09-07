#!/usr/bin/env bash

alteredFilePaths=$(git ls-files -m '*.js');
files=( "$@" )

function _lint () {
  echo "TCR => LINT"
  npx eslint $alteredFilePaths --fix
}

function _test () {
  echo "TCR => TEST"
  npm run test:api:path "${files[0]}" -- --bail
}

function _commit () {
  echo "TCR => COMMIT"
  git commit -am "TCR:WIP"
}

function _revert () {
  echo "TCR => REVERT"
  git checkout HEAD lib/
}

if [ -z "$alteredFilePaths" ] ; then
  echo "TCR => NOTHING HAS CHANGED"
  exit 1
fi

if ! _lint ; then
  exit 1
fi

if _test ; then _commit ; else _revert ; fi
