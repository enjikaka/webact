build:
	npx esbuild src/index.js --bundle --minify --sourcemap --format=esm --platform=browser --target=chrome58 --outfile=pkg/index.js
	npx tsc
	deno run --allow-run --allow-read --allow-write scripts/compile-package-json.ts
	cp README.md pkg/README.md
	cp pkg/index.js docs/webact.js

release:
	npm version patch
	make build
	cd pkg && npm publish
	git push --follow-tags

test: build
	cp pkg/index.js docs/webact.js
	http-server docs -p 1444
