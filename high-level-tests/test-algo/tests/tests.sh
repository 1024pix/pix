#!/bin/bash

testExit() {
  local description=$1
  local command=$2
  local expectedExitCode=$3
  local output

  output=$($command 2>&1)
  local actualExitCode=$?

  echo "## $description"
  if [ "$actualExitCode" != "$expectedExitCode" ]; then
    echo "TEST FAILED: expected $command to exit with $expectedExitCode but got $actualExitCode"
    echo "$output"
  else
    echo "SUCCESS"
  fi
}

testExit 'should fetch challenge when competenceId is specified' 'npm start -- --competenceId example_competence_id' 0
testExit 'should return error when no competenceId is specified' "npm start" 1
testExit 'should return error when specified locale does not exist' "npm start --competenceId example_competence_id --locale non-existing-locale" 1
testExit 'should fetch challenge when competenceId and locale are specified' "npm start --competenceId example_competence_id --locale fr" 1
