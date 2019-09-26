 # Colors
BLUE="\033[0;36m"
LBLUE="\033[1;34m"
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

# ---------------------------------- Arrays ----------------------------------- #
# Arguments Arrays
args=("1 two" "1 two 3 4" "1 two 3" "1" "1 two 3 4 5" "two 1 three four five" "1 two 3 4")

# Commands Arrays
cmd=("node example hasRule")

notations=("hasRule <num> <num/str> [num]")

# Test Names & Expected Arrays
testNames=("Required             " "Optional (2)         " "Optional (1)         " "Missing required     " "Too many             " "Wrong type           " "Multiple Rules       ") 
expected=("      true" "      true" "      true" "     false" "     false" "     false" "      true")


# ------------------------------- Begin Printing ------------------------------ #
printf "\n${BLUE}»         Argument Validation         «${NC}\n\n"
printf "${LBLUE}Arguments            Result    Expected${NC}\n\n"
printf "${LBLUE}» ${notations[0]}${NC}\n"

for ((i = 0 ; i < 7 ; i++)); do
	command="$(${cmd[0]} ${args[i]})"
  echo "Args: ${args[i]}"
	if [[ "${command}" == "${expected[i]//[^*a-z]/}" ]]; then
	 	printf "${GREEN}${testNames[i]}${command}${expected[i]}${NC}\n"
	else
	 	printf "${RED}${testNames[i]}${command}${expected[i]}${NC}\n"
	fi
  echo " "
done

echo ""
