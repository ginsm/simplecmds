 # Colors
BLUE="\033[0;36m"
LBLUE="\033[1;34m"
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

# ---------------------------------- Arrays ----------------------------------- #
# Command
cmd=("node example")

# Arguments
args=("hasRule 1 two" 
      "hasRule 1 two 3 4" 
      "hasRule 1 two 3" 
      "hasRule 1 two 3 4" 
      "bool"
      "hasRule 1" 
      "hasRule 1 two 3 4 5" 
      "hasRule two 1 three four five"
      "")

# Test Names
testNames=("Required             " 
           "Optional (2)         " 
           "Optional (1)         " 
           "Multiple Rules       " 
           "Bool Command         " 
           "Missing required     " 
           "Too many             " 
           "Wrong type           "
           "No cmd or args       ") 

# Expected result
expected=("      true" 
          "      true" 
          "      true" 
          "      true" 
          "      true" 
          "     false" 
          "     false" 
          "     false"
          "     ")


# ------------------------------- Begin Printing ------------------------------ #
printf "\n${BLUE}»         Argument Validation         «${NC}\n\n"
printf "${LBLUE}Arguments            Result    Expected${NC}\n"

for ((i = 0 ; i < 9 ; i++)); do
	command="$(${cmd[0]} ${args[i]})"
	if [[ "${command}" == "${expected[i]//[^*a-z]/}" ]]; then
	 	printf "${GREEN}${testNames[i]}${command}${expected[i]}${NC}\n"
	else
	 	printf "${RED}${testNames[i]}${command}${expected[i]}${NC}\n"
	fi
done

echo ""
