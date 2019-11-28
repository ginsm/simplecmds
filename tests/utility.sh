# SECTION - Colors
RESTORE='\033[0m'
DESC='\033[01;37m'
PASS='\033[01;32m'
FAIL='\033[01;31m'
HEADER='\033[01;33m'
ACTION='\033[00;33m'

# SECTION - Variables
count=0
passed=0
failed=0
verbose=$1
success="${PASS}Passed${RESTORE}"
section="Status: ${PASS}Passed${RESTORE}"

# SECTION - Test definition tool
define() {
  local desc="${1}"
  local expected="${2}"
  local result=$(${3})

  if [[ "${result}" == "${expected}" ]]; then
    if [[ "${verbose}" == "true" ]]; then
      printf "${DESC}${desc}${RESTORE}"
      newline

      printf "Status: ${PASS}Passed${RESTORE}"
      newline 2
    fi
    passed=$(($passed + 1))

  else
    printf "${DESC}${desc}${RESTORE}"
    newline

    printf "Status: ${FAIL}Failed${RESTORE} (${result})"
    newline 2

    success="${FAIL}Failed${RESTORE}"
    section="${FAIL}Failed${RESTORE}"
    
    failed=$(($failed + 1))
    
  fi

  count=$(($count + 1))
}


# SECTION - Helper Functions
newline() {
  if [[ ! ${1} ]]; then
    printf "\n"
  elif (( $1 > 1 )); then 
    for i in $(seq $1); do
      printf "\n"
    done
  else 
    printf "\n"
  fi
}

header() {
  newline
  printf "${HEADER}[  ${1}  ]${RESTORE}"
  newline 2
}

end_section() {
  if [[ "${verbose}" == "false" ]]; then
    if [[ "${section}" != "${FAIL}Failed${RESTORE}" ]]; then
      printf "${section}"
      newline 2
    fi
    section="Status: ${PASS}Passed${RESTORE}"
  fi
}

verbose_enabled() {
  local command="${1}"
  if [[ "${verbose}" == "false" ]]; then
  printf "Run '${ACTION}${command}${RESTORE}' to see all of the test definitions."
  newline 2
fi
}