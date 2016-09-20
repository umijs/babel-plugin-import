
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync babel-plugin-import
	tnpm sync babel-plugin-import

