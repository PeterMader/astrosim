@cd .\scenes
@echo module.exports=[ > ./list.js

@for %%v in (*.json) do @echo require(^'./%%v^'^), >> ./list.js
@echo ] >> ./list.js

@cd ..
@browserify astrosim.js -o dist/astrosim.js
