#!/bin/bash

# Script to build the sencha app into dist/

git diff --exit-code || (echo "You have unstaged changes, please commit and try again."; exit 1;)

git rm -rf dist
rm -rf dist
mkdir dist

sencha app build $@ &&
  echo "+ copying build artefacts into dist" &&
  cp -vR build/production/LIME/ dist/ &&
  # ignore php files, we don't use them and they're big
  rm -rf dist/php &&
  # ignore changes to everything except dist
  git status --porcelain | grep 'M ' | grep -v dist/ | awk '{print $2}' | xargs git checkout --
