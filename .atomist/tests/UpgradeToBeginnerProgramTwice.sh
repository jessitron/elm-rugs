#!/usr/bin/env sh

set -e
set -x

echo "Running a bunch of rugs in succession"
echo "This test requires elm installed"

project_parent_dir=$(mktemp -d)
project_name="banana"

rug -lRC $project_parent_dir generate StaticPage $project_name

project_dir=$project_parent_dir/$project_name

rug -lRC $project_dir edit UpgradeToBeginnerProgram
rug -lRC $project_dir edit UpgradeToBeginnerProgram

cd $project_dir
./build --yes
cd -
rm -rf $project_parent_dir
