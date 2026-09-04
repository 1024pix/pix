// Dev-server middleware: simulate the production Content-Security-Policy.
//
// 'unsafe-eval' is added so Ember CLI's eval-based source maps keep working
// in development. Everything else mirrors the production CSP so that
// CSP-sensitive code (e.g. the Worker sandbox) can be validated locally
// without needing a review-app deployment.
//
// Remove or comment this file to restore the default (no CSP) behaviour.

const PROD_CSP = [
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self'",
  'frame-src epreuves.pix.fr *.review.pix.fr 1024pix.github.io data:',
  "connect-src 'self' plausible.io analytics.pix.fr pix-stats.cloud-ed.fr *.ingest.sentry.io",
  // 'unsafe-eval' added for Ember CLI dev-server (eval-based source maps).
  "script-src 'self' 'unsafe-eval' plausible.io analytics.pix.fr",
].join('; ');

module.exports = function (app) {
  app.use((_req, res, next) => {
    res.setHeader('Content-Security-Policy', PROD_CSP);
    next();
  });
};
