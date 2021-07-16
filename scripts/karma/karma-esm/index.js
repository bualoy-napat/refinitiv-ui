#!/usr/bin/env node
const request = require('request');
const micromatch = require('micromatch');
const { virtualFilePrefix } = require('es-dev-server');
const esmFramework = require('@open-wc/karma-esm/src/esm-framework.js');
const { createEsmConfig } = require('@open-wc/karma-esm/src/esm-config');
const setupDevServer = require('@open-wc/karma-esm/src/setup-es-dev-server');

// Override configurations to support snapshots
function esmMiddlewareFactory(config, karmaEmitter) {
  try {
    const karmaConfig = config;
    const watch = karmaConfig.autoWatch;

    const { esmConfig, babelConfig } = createEsmConfig(karmaConfig);

    // setting up the server is async, but we need to synchronously return a middleware.
    // set up the server and keep a promise that can be awaited
    let devServerHost;
    let setupServerPromise = setupDevServer(
      karmaConfig,
      esmConfig,
      watch,
      babelConfig,
      karmaEmitter,
    )
      .then(host => {
        devServerHost = host;
        setupServerPromise = null;
      })
      .catch(console.error);

    /**
     * Karma middleware to proxy requests to es-dev-server. This way, es-dev-server
     * can resolve module imports and/or run babel/compatibility transforms on the files.
     *
     * @type {import('connect').NextHandleFunction}
     */
    async function esmMiddleware(req, res, next) {
      try {
        // wait for server to be set up if it hasn't yet
        if (!setupServerPromise) {
          await setupServerPromise;
        }

        const urlsForDevServer = [
          // context and debug are the HTML entrypoints for karma, they are
          // proxied to es-dev-server in order to run compatibility mode on them
          // from es-dev-server, they are requested again using the "bypass-es-dev-server"
          // query param, so that karma can serve the original file. they are processed
          // by es-dev-server afterwards
          '/context.html',
          '/debug.html',
          // all relative requests are prefixed with /base
          '/base',
          // files generated by es-dev-server
          '/polyfills',
          '/inline-script-',
          virtualFilePrefix,
        ];

        // some files we need to overwrite and serve from karma instead
        const karmaExclude = esmConfig.karmaExclude || [];

        const [url, params] = req.url.split('?');

        const proxyToDevServer =
          (!params || !params.includes('bypass-es-dev-server')) &&
          urlsForDevServer.some(u => url.startsWith(u)) &&
          !micromatch.isMatch(url, karmaExclude);

        if (proxyToDevServer) {
          const proxyUrl = `${devServerHost}${req.url.replace('/base', '')}`;
          const forwardRequest = request(proxyUrl).on('error', () => {
            // don't log proxy errors
          });
          req.pipe(forwardRequest);
          forwardRequest.pipe(res);
        } else {
          next();
        }
      } catch (error) {
        console.error('Error while proxying to es-dev-server', error);
        throw error;
      }
    }

    return esmMiddleware;
  } catch (error) {
    // karma swallows stack traces, so log them here manually
    console.error('Error while setting up es-dev-server middleware', error);
    throw error;
  }
}

esmMiddlewareFactory.$inject = ['config', 'emitter'];

module.exports = {
  'framework:esm': ['factory', esmFramework],
  'middleware:esm': ['factory', esmMiddlewareFactory],
};