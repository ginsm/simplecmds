#!/bin/sh

# SECTION - Variables
wdir=$(cd "$(dirname "${0}")" ; pwd -P)
cmd="node $wdir/interface"


# SECTION - Importing
. $wdir/utility.sh $1


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
      "$cmd -s 'string'"

  define "Command expecting string returns false when given number" \
      "false" \
      "$cmd -s 42"

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

  define "Command with optional argument should be true with no argument" \
      "undefined true" \
      "$cmd -o"

  define "Command with optional argument should be false with invalid argument" \
      "stringer false" \
      "$cmd -o stringer"

  define "Zero is properly converted to type number" \
      "true" \
      "$cmd -n 0"

end_section



header "Testing: Concatenated Commands"

  define "Concatenated aliases work and validate properly" \
      "false
true" \
      "$cmd -sn 20,20"

  define "Concatenated arguments provided to concatenated aliases work and validate properly" \
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

  define "Command with more required arguments than amount utilizes required amount instead" \
      "2" \
      "$cmd -a -w 20 'string'"

end_section



header "Summary"
printf "Passed: ${HEADER}${passed}${RESTORE}"
newline
printf "Failed: ${HEADER}${failed}${RESTORE}"
newline
printf "Status: ${success}"

newline 2

verbose_disabled "npm run test:verbose"