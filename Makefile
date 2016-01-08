
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync dora-plugin-proxy
	tnpm sync dora-plugin-proxy

