#!/bin/bash

cd ./scenes
echo "module.exports=[" > ./list.js

for scene in *.json; do
  echo "require('./$scene')," >> ./list.js
done

echo "]" >> ./list.js

cd ..
./node_modules/.bin/browserify astrosim.js -o dist/astrosim.js
