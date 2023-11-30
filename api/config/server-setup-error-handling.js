import * as preResponseUtils from '../lib/application/pre-response-utils.js';
import * as sharedPreResponseUtils from '../src/shared/application/pre-response-utils.js';

import { authenticationDomainErrorMappingConfiguration } from '../src/authentication/application/http-error-mapper-configuration.js';
import { sessionDomainErrorMappingConfiguration } from '../src/certification/session/application/http-error-mapper-configuration.js';
import { certificationDomainErrorMappingConfiguration } from '../src/certification/shared/application/http-error-mapper-configuration.js';
import { domainErrorMapper } from '../src/shared/application/domain-error-mapper.js';

const setupErrorHandling = function (server) {
  const configuration = [
    ...authenticationDomainErrorMappingConfiguration,
    ...sessionDomainErrorMappingConfiguration,
    ...certificationDomainErrorMappingConfiguration,
  ];

  domainErrorMapper.configure(configuration);

  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
  server.ext('onPreResponse', sharedPreResponseUtils.handleDomainAndHttpErrors);
};

export { setupErrorHandling };
