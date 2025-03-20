const { onRequest } = require('firebase-functions/v2/https');
const { log } = require('firebase-functions/logger');
const { default: next } = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

exports.nextjs = onRequest((req, res) => {
	log('File: ' + req.path);
	return app.prepare().then(() => handle(req, res));
});
