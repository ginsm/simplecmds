#!/bin/sh

# SECTION - Variables
wdir=$(cd "$(dirname "${0}")" ; pwd -P)
cmd="node $wdir/test-interface"


# SECTION - Importing
source $wdir/utility.sh $1


# SECTION - Script Header
header "Simplecmds Test Script"
printf "These tests are designed to ensure that the packages functionality is working
as intended. It uses an interface that was created via simplecmds for testing
purposes (${ACTION}test-interface.js${RESTORE})."
newline 2


# SECTION - Test Definitions
header "Testing: Type Checking"

  define "Command expecting string returns true when given string" \
      "true" \
      "$cmd -t 'string'"

  define "Command expecting string returns false when given number" \
      "false" \
      "$cmd -t 42"

  define "Command expecting bool returns true when no arguments are given" \
      "true" \
      "$cmd -b"

  define "Command expecting bool returns false when given arguments" \
      "false" \
      "$cmd -b 0"

  define "Command accepting number or string returns true when given number" \
      "true" \
      "$cmd -A 20"

  define "Command accepting number or string returns false when given no arguments" \
      "false" \
      "$cmd -A"

  define "Command expecting multiple arguments/types returns true when given proper arguments" \
      "true" \
      "$cmd -m 'string' 20"

  define "Command expecting multiple arguments/types returns false when given improper arguments" \
      "false" \
      "$cmd -m 20 'string'"

end_section



header "Testing: Concatenated Commands"

  define "Concatenated aliases work and validate properly" \
      "false
true" \
      "$cmd -tn 20,20"

  define "Multiple arguments provided to multiple aliases work and validate properly" \
      "true
true" \
      "$cmd -mA string+42,string"

end_section



header "Testing: Argument Amounts"

  define "Command enforcing at most 3 arguments returns 3 when given 4 arguments" \
      "3" \
      "$cmd -a -l 'one' 'two' 'three' 'four'"

  define "Command enforcing at most 3 optional arguments returns 2 when given 2 arguments" \
      "2" \
      "$cmd -a -l 'one' 'two'"
end_section



header "Summary"
printf "Passed: ${HEADER}${passed}${RESTORE}"
newline
printf "Failed: ${HEADER}${failed}${RESTORE}"
newline
printf "Status: ${success}"

newline 2

verbose_enabled "npm run test:verbose"