import * as preResponseUtils from '../lib/application/pre-response-utils.js';
import * as sharedPreResponseUtils from '../src/shared/application/pre-response-utils.js';

const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
  server.ext('onPreResponse', sharedPreResponseUtils.handleDomainAndHttpErrors);
};

export { setupErrorHandling };
