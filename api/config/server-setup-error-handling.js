import { certificationDomainErrorMappingConfiguration } from '../src/certification/shared/application/http-error-mapper-configuration.js';
import { devcompDomainErrorMappingConfiguration } from '../src/devcomp/application/http-error-mapper-configuration.js';
import { evaluationDomainErrorMappingConfiguration } from '../src/evaluation/application/http-error-mapper-configuration.js';
import { authenticationDomainErrorMappingConfiguration } from '../src/identity-access-management/application/http-error-mapper-configuration.js';
import { organizationalEntitiesDomainErrorMappingConfiguration } from '../src/organizational-entities/application/http-error-mapper-configuration.js';
import { prescriptionDomainErrorMappingConfiguration } from '../src/prescription/shared/application/http-error-mapper-configuration.js';
import { schoolDomainErrorMappingConfiguration } from '../src/school/application/http-error-mapper-configuration.js';
import { domainErrorMapper } from '../src/shared/application/domain-error-mapper.js';
import * as preResponseUtils from '../src/shared/application/pre-response-utils.js';
import { teamDomainErrorMappingConfiguration } from '../src/team/application/http-error-mapper-configuration.js';

const setupErrorHandling = function (server) {
  const configuration = [
    ...authenticationDomainErrorMappingConfiguration,
    ...organizationalEntitiesDomainErrorMappingConfiguration,
    ...teamDomainErrorMappingConfiguration,
    ...certificationDomainErrorMappingConfiguration,
    ...devcompDomainErrorMappingConfiguration,
    ...evaluationDomainErrorMappingConfiguration,
    ...prescriptionDomainErrorMappingConfiguration,
    ...schoolDomainErrorMappingConfiguration,
  ];

  domainErrorMapper.configure(configuration);

  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
};

export { setupErrorHandling };
