#!/usr/bin/env bash

set -e
set -o pipefail

EXPECTED_NODE_VERSION="v12.14.1"
EXPECTED_NPM_VERSION="6.13.4"

function display_banner() {
  echo "                                                    "
  echo "                                                    "
  echo "PPPPPPPPPPPPPPPPP       iiii                        "
  echo "P::::::::::::::::P     i::::i                       "
  echo "P::::::PPPPPP:::::P     iiii                        "
  echo "PP:::::P     P:::::P                                "
  echo "  P::::P     P:::::P  iiiiiii   xxxxxxx      xxxxxxx"
  echo "  P::::P     P:::::P  i:::::i    x:::::x    x:::::x "
  echo "  P::::PPPPPP:::::P    i::::i     x:::::x  x:::::x  "
  echo "  P:::::::::::::PP     i::::i      x:::::x :::::x   "
  echo "  P::::PPPPPPPPP       i::::i       x:::::x :::x    "
  echo "  P::::P               i::::i        x:::::x :x     "
  echo "  P::::P               i::::i        x:::::x :x     "
  echo "  P::::P               i::::i       x:::::x :::x    "
  echo "PP::::::PP            i::::::i     x:::::x :::::x   "
  echo "P::::::::P            i::::::i    x:::::x  x:::::x  "
  echo "P::::::::P            i::::::i   x:::::x    x:::::x "
  echo "PPPPPPPPPP            iiiiiiii  xxxxxxx      xxxxxxx"
  echo "                                                    "
  echo "                                                    "
}

function display_header {
  echo "👋 Welcome to the Pix developer environment installation & configuration procedure."
  echo "The good news is that the procedure is fully automated!"
  echo "The bad news is that it will take up to 15mn (as 7 000 tests should be run)."
  echo "So, please take a ☕️ and enjoy this awesome moment."
  echo "If you get bored, you can always visit or website https://pix.fr or follow us on Twitter https://twitter.com/pix_officiel 😉"
  echo ""
}

function assert_program_is_installed() {
  local program=$1
  if ! [ -x "$(command -v "${program}")" ]; then
    echo "Error: program \"${program}\" is not installed." >&2
    exit 1
  fi
}

function assert_expected_version_is_installed() {
  local program=$1
  local expected_version=$2
  local installed_version=$("${program}" -v)

  if [ "${installed_version}" != "${expected_version}" ]; then
    echo "Error: expected version ${expected_version} to be installed for program \"${program}\"but found version ${installed_version}." >&2
    exit 1
  fi
}

function verify_prerequesite_programs() {
  echo "Verifying prerequesite programs…"

  assert_program_is_installed "git"
  assert_program_is_installed "node"
  assert_program_is_installed "npm"
  assert_program_is_installed "docker"
  assert_program_is_installed "docker-compose"

  assert_expected_version_is_installed "node" "${EXPECTED_NODE_VERSION}"
  assert_expected_version_is_installed "npm" "${EXPECTED_NPM_VERSION}"

  echo "✅ Required programs have been found."
  echo ""
}

function generate_environment_config_file() {
  echo "Generating environment config file for Pix API (api/.env)…"

  cp api/sample.env api/.env

  echo "✅ api/.env file copied from api/sample.env."
  echo ""
}

function install_apps_dependencies() {
  echo "Installing Pix apps dependencies…"

  npm install
  (cd admin && npm install --no-optional)
  (cd api && npm install --no-optional)
  (cd certif && npm install --no-optional)
  (cd mon-pix && npm install --no-optional)
  (cd orga && npm install --no-optional)
  (cd pix-ui && npm install --no-optional)

  echo "✅ Dependencies installed."
  echo ""
}

function setup_and_run_infrastructure() {
  echo "Starting infrastructure building blocks…"

  docker-compose up -d
  (cd api && npm run db:migrate)

  echo "✅ PostgreSQL and Redis servers started (using Docker Compose)."
  echo ""
}

function execute_apps_tests() {
  echo "Executing Pix apps tests…"

  (cd admin && npm test)
  (cd api && npm test)
  (cd certif && npm test)
  (cd mon-pix && npm test)
  (cd orga && npm test)
  (cd pix-ui && npm test)

  echo "✅ Tests passed."
  echo ""
}

function display_footer {
  echo "🎉 Congratulations! Your environment is now running."
  echo ""
  echo "In this terminal window, execute the following command:"
  echo ""
  echo "  $ npx run-p start:api start:mon-pix"
  echo ""
  echo "Then navigate to http://localhost:4200"
  echo ""
  echo "Other links:"
  echo "  - Website: https://pix.fr"
  echo "  - GitHub: https://github.com/1024pix/pix"
  echo ""
}

# Main

display_banner
display_header
verify_prerequesite_programs
generate_environment_config_file
install_apps_dependencies
setup_and_run_infrastructure
execute_apps_tests
display_footer
