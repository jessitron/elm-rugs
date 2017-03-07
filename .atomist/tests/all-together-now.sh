#!/usr/bin/env sh

set -e
set -x

echo "Running a bunch of rugs in succession"
echo "This test requires elm installed"

project_parent_dir=$(mktemp -d)
project_name="banana"

rug -lRC $project_parent_dir generate StaticPage $project_name

project_dir=$project_parent_dir/$project_name

#rug -lRC $project_dir edit UpgradeToBeginnerProgram
#rug -lRC $project_dir edit AddButton button_text="Hello There" button_message=HelloThere
#rug -lRC $project_dir edit AddTextInput input_name=beginnerInput
#rug -lRC $project_dir edit UpgradeToProgram
#rug -lRC $project_dir edit AddButton button_text="Hello Again" button_message=HelloAgain
#rug -lRC $project_dir edit AddTextInput input_name=advancedInput
rug -lRC $project_dir edit SubscribeToClicks

cd $project_dir
./build --yes
cd -
rm -rf $project_parent_dir
