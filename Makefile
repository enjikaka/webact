build:
	npx esbuild src/index.js --bundle --minify --sourcemap --format=esm --outfile=pkg/index.js
	npx tsc
	deno run --allow-read --allow-write scripts/compile-package-json.ts
	cp README.md pkg/README.md

release:
	npm version patch
	make build
	cd pkg && npm publish
	git push --follow-tags

test:
	cp pkg/index.js docs/webact.js
	http-server docs -p 1444
