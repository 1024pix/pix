#!/usr/bin/env bash

set -e
set -o pipefail

function timeout() { perl -e 'alarm shift; exec @ARGV' "$@"; }

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
  echo "The good news is that the procedure is fully automated and last less than 5 minutes!"
  echo "So, please take a ☕️ and enjoy this awesome moment."
  echo "If you get bored, you can always visit our website https://pix.fr or follow us on Twitter https://twitter.com/pix_officiel 😉"
  echo ""
}

function assert_program_is_installed() {
  local program=$1
  if ! [ -x "$(command -v "${program}")" ]; then
    echo "Error: program \"${program}\" is not installed." >&2
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

  echo "✅ Required programs have been found."
  echo ""
}

function generate_environment_config_file() {
  echo "Generating environment config file for Pix API (api/.env)…"

  cp api/sample.env api/development.env

  echo "✅ api/development.env file copied from api/sample.env."
  echo ""
}

function install_apps_dependencies() {
  echo "Installing Pix apps dependencies…"

  npm install
  npm run ci:all

  echo "✅ Dependencies installed."
  echo ""
}

function setup_and_run_infrastructure() {
  echo "Starting infrastructure building blocks…"

  docker-compose up -d --force-recreate

  echo "✅ PostgreSQL and Redis servers started (using Docker Compose)."
  echo ""

  echo "Waiting for PostgreSQL server to be ready…"

  timeout 20s bash -c "until docker-compose exec postgres pg_isready ; do sleep 1 ; done"

  echo "✅ PostgreSQL server is ready."
  echo ""

  echo "Creating database"

  # It drops and creates database then load the seed.
  (cd api && npm run db:reset)

  echo "✅ Database created"
  echo ""
}

function display_footer {
  echo "🎉 Congratulations! Your environment has been set up."
}

# Main

display_banner
display_header
verify_prerequesite_programs
generate_environment_config_file
install_apps_dependencies
setup_and_run_infrastructure
display_footer
