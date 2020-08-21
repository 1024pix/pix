alteredFilePaths=$(git ls-files -m '*.js');

if [ ! -z "$alteredFilePaths" ] ; then
  if eslint $alteredFilePaths --fix ; then
    if npm run test:api:path $@ -- --bail; then
      echo "TCR => COMMIT"
      git commit -am "TCR:WIP"
    else
      echo "TCR => REVERT"
      git checkout HEAD lib/
    fi
  else
    echo "TCR => ABORT"
  fi
else
  echo "TCR => NOTHING HAS CHANGED"
fi

