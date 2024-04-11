import * as preResponseUtils from '../lib/application/pre-response-utils.js';
import { authenticationDomainErrorMappingConfiguration } from '../src/authentication/application/http-error-mapper-configuration.js';
import { courseDomainErrorMappingConfiguration } from '../src/certification/course/application/http-error-mapper-configuration.js';
import { sessionDomainErrorMappingConfiguration } from '../src/certification/session/application/http-error-mapper-configuration.js';
import { certificationDomainErrorMappingConfiguration } from '../src/certification/shared/application/http-error-mapper-configuration.js';
import { devcompDomainErrorMappingConfiguration } from '../src/devcomp/application/http-error-mapper-configuration.js';
import { evaluationDomainErrorMappingConfiguration } from '../src/evaluation/application/http-error-mapper-configuration.js';
import { prescriptionDomainErrorMappingConfiguration } from '../src/prescription/shared/application/http-error-mapper-configuration.js';
import { schoolDomainErrorMappingConfiguration } from '../src/school/application/http-error-mapper-configuration.js';
import { domainErrorMapper } from '../src/shared/application/domain-error-mapper.js';
import * as sharedPreResponseUtils from '../src/shared/application/pre-response-utils.js';

const setupErrorHandling = function (server) {
  const configuration = [
    ...authenticationDomainErrorMappingConfiguration,
    ...courseDomainErrorMappingConfiguration,
    ...sessionDomainErrorMappingConfiguration,
    ...certificationDomainErrorMappingConfiguration,
    ...devcompDomainErrorMappingConfiguration,
    ...evaluationDomainErrorMappingConfiguration,
    ...prescriptionDomainErrorMappingConfiguration,
    ...schoolDomainErrorMappingConfiguration,
  ];

  domainErrorMapper.configure(configuration);

  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
  server.ext('onPreResponse', sharedPreResponseUtils.handleDomainAndHttpErrors);
};

export { setupErrorHandling };
