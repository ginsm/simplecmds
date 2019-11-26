# SECTION - Received from tests.sh
title="$1"
HEADER="$2"
PASS="$3"
FAIL="$4"
RESTORE="$5"
shift 5
arr=("$@")


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


# SECTION - Variables
start=0
iterations="$((${#arr[@]} / 3))"


# SECTION - Run test
printf "$HEADER[  $title  ]$RESTORE"
newline 2

for i in $(seq 1 $iterations); do
  # Assign variables
  cmd=${arr[$start]}
  expect=${arr[$(($start + 1))]}
  desc=${arr[$(($start + 2))]}

  # Set next start value
  start=$(($start + 3))

  # Resolve command
  result=$($cmd)

  # Output description
  printf "$HEADER$desc$RESTORE"
  newline

  # Output result
  if [[ "$result" == "$expect" ]]; then
    printf "Status: ${PASS}Passed$RESTORE"
  else
    printf "Status: ${FAIL}Failed$RESTORE"
    all_passed="${FAIL}Failed$RESTORE"
  fi
  
  newline 2
done

newline