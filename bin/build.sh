#!/bin/bash

cd ./scenes
echo "module.exports=[" > ./list.js

for scene in *.json; do
  echo "require('./$scene')," >> ./list.js
done

echo "]" >> ./list.js

cd ..
./node_modules/.bin/browserify astrosim.js | ./node_modules/.bin/babel --presets=es2015 | ./node_modules/.bin/uglifyjs -m > dist/astrosim.js
