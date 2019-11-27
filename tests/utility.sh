# SECTION - Colors
RESTORE='\033[0m'
DESC='\033[01;37m'
PASS='\033[01;32m'
FAIL='\033[01;31m'
HEADER='\033[01;33m'
ACTION='\033[01;33m'

# SECTION - Variables
count=0
passed=0
failed=0
verbose=$1


# SECTION - Test definition tool
function define() {
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

    printf "Status: ${FAIL}Failed${RESTORE}"
    newline 2

    success="${FAIL}Failed${RESTORE}"
    failed=$(($failed + 1))
    
  fi

  count=$(($count + 1))
}


# SECTION - Helper Functions
function newline() {
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

function header() {
  newline
  printf "${HEADER}[  ${1}  ]${RESTORE}"
  newline 2
}