@cd .\scenes
@echo module.exports=[ > .\list.js

@for %%v in (*.json) do @echo require(^'./%%v^'^), >> .\list.js
@echo ] >> .\list.js

@cd ..
@.\node_modules\.bin\browserify astrosim.js | .\node_modules\.bin\babel --presets=es2015 | .\node_modules\.bin\uglifyjs -m > dist\astrosim.js
