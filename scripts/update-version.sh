# release_type is required in input
# release_type can be: major, minor, patch
release_type=$1
if [ -z "$release_type" ]; then
  echo "release_type is required"
  exit 1
fi

for d in admin/ api/ certif/ audit-logger/ high-level-tests/load-testing/ high-level-tests/e2e/ junior/ mon-pix/ orga/; do
  if [ -d "$d" ]; then
    (
      cd "$d" || exit
      echo $(pwd)
      npm version "$release_type" --no-git-tag-version
    )
  else
    echo "Directory $d does not exist"
  fi
done
