#!/bin/bash

GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
RESET=$(tput sgr0)

testExit() {
  local description=$1
  local command=$2
  local expectedExitCode=$3
  local output

  output=$($command 2>&1)
  local actualExitCode=$?

  echo "## $description"
  if [ "$actualExitCode" != "$expectedExitCode" ]; then
    echo "${RED}❌ TEST FAILED: expected $command to exit with $expectedExitCode but got $actualExitCode ${RESET}"
    echo "$output"
    exit 2
  else
    echo "${GREEN}✅ SUCCESS ${RESET}"
  fi
}

testExit 'should fetch challenge when competenceId is specified' 'npm start -- --competenceId example_competence_id' 0
testExit 'should fetch challenge when targetProfileId is specified' 'npm start -- --targetProfileId 1' 0
testExit 'should return error when no argument is specified' "npm start" 1
testExit 'should return error when specified locale does not exist' "npm start --competenceId example_competence_id --locale non-existing-locale" 1
testExit 'should fetch challenge when competenceId and locale are specified' "npm start --competenceId example_competence_id --locale fr" 1
