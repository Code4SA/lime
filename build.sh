#!/bin/bash

# Script to build the sencha app but preserve only the changes
# to the build dir

git diff --exit-code || (echo "You have unstaged changes, please commit and try again."; exit 1;)

sencha app build $@ &&
  # ignore changes to everything except build
  git status --porcelain | grep 'M ' | grep -v build/ | awk '{print $2}' | xargs git checkout --
