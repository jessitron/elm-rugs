#!/usr/bin/env sh

set -e
set -x

rug_command="rug"

echo "Running a bunch of rugs in succession"
echo "This test requires elm installed"

project_parent_dir=$(mktemp -d)
project_name="banana"
org="jessitron"

$rug_command generate StaticPage $project_name org=$org -lRC $project_parent_dir -X

project_dir=$project_parent_dir/$project_name

rug edit AddImport import="Html.Attributes" -lRC $project_dir -X
rug edit AddFunction name="drawLabel" type="{ text: String } -> Html Never" parameters="{ text }" body="Html.label [] [ Html.text text ]" -lRC $project_dir -X
rug edit ChangeMain newBody="Html.main_ [] [ Html.canvas [ Html.Attributes.style [ ( \"backgroundImage\", \"url(elmbp.png)\" ) ] ] [ drawLabel { text = \"yes\" }] ]" -lRC $project_dir -X
rug edit UpgradeToBeginnerProgram -lRC $project_dir
#rug -lRC $project_dir edit AddButton button_text="Hello There" button_message=HelloThere
#rug -lRC $project_dir edit AddTextInput input_name=beginnerInput
#rug -lRC $project_dir edit UpgradeToProgram
#rug -lRC $project_dir edit AddButton button_text="Hello Again" button_message=HelloAgain
#rug -lRC $project_dir edit AddTextInput input_name=advancedInput
#rug -lRC $project_dir edit SubscribeToClicks

cd $project_dir
./build --yes
cd -
rm -rf $project_parent_dir
