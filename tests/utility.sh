# SECTION - Colors
RESTORE='\033[0m'
DESC='\033[01;37m'
PASS='\033[01;32m'
FAIL='\033[01;31m'
HEADER='\033[01;33m'


# SECTION - Test definition tool
function define() {
  local desc="${1}"
  local expected="${2}"
  local result=$(${3})
  
  printf "${DESC}${desc}${RESTORE}"
  newline

  if [[ "${result}" == "${expected}" ]]; then
    printf "Status: ${PASS}Passed${RESTORE}"
  else
    printf "Status: ${FAIL}Failed${RESTORE}"
  fi

  newline 2
}


# SECTION - Helper Functions
function newline() {
  if [[ ! $1 ]]; then
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