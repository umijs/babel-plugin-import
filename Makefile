
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync babel-plugin-antd
	tnpm sync babel-plugin-antd

