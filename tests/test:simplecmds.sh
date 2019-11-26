#!/bin/bash

# SECTION - Fixed Variables
wdir=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
RESTORE='\033[0m'
HEADER='\033[01;37m'
PASS='\033[01;32m'
FAIL='\033[01;31m'
status="${PASS}Passed$RESTORE"
reusable=(
  "$HEADER"
  "$PASS"
  "$FAIL"
  "$RESTORE"
)


# SECTION - Variables
cmd="node $wdir/test-interface"
title="Simplecmds Test Script"


# SECTION - Header
printf "\n${HEADER}[  $title  ]${RESTORE}\n\n"
printf "These tests are designed to ensure that the packages functionality is working
as intended. It uses an interface that was created for the tests to cover all of the
functionality.\n\n"

# SECTION - Helper Functions
run_test() {
  local title="$1"
  shift
  local arr=("$@")
  sh $wdir/run.sh "$title" "${reusable[@]}" "${arr[@]}"
}


# SECTION - Test Definitions
# Configure with 3 array items per test:
# - command arguments
# - expected output
# - description

validation_check=(
  "$cmd -t string"
  "true"
  "Command expecting string returns true when given string"

  "$cmd -t 42"
  "false"
  "Command expecting string returns false when given number"

  "$cmd -b"
  "true"
  "Command expecting bool returns true when no arguments are given"

  "$cmd -b 0"
  "false"
  "Command expecting bool returns false when given arguments"

  "$cmd -tn 30,20"
  "false
true"
  "Concatenated arguments work and validate properly"

  "$cmd -A 20"
  "true"
  "Command accepting number or string returns true when given number"

  "$cmd -A"
  "false"
  "Command accepting number or string returns false when given no arguments"

  "$cmd -m 'string' 20"
  "true"
  "Command expecting multiple arguments/types returns true when given proper arguments"

  "$cmd -m 20 'string'"
  "false"
  "Command expecting multiple arguments/types returns false when given improper arguments"
)

length_tests=(
  "$cmd -a -l one two three four"
  "3"
  "Command enforcing 3 arguments max returns 3 for args length when given 4 arguments"
)

# SECTION - Test Executions
# run_test "Correct Arguments" "${type_check_valid_true[@]}"
# run_test "Incorrect Arguments" "${type_check_valid_false[@]}"
run_test "Type Check Tests" "${validation_check[@]}"

run_test "Argument Length Tests" "${length_tests[@]}"