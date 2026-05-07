import { certificationDomainErrorMappingConfiguration } from '../src/certification/shared/application/http-error-mapper-configuration.js';
import { devcompDomainErrorMappingConfiguration } from '../src/devcomp/application/http-error-mapper-configuration.js';
import { evaluationDomainErrorMappingConfiguration } from '../src/evaluation/application/http-error-mapper-configuration.js';
import { authenticationDomainErrorMappingConfiguration } from '../src/identity-access-management/application/http-error-mapper-configuration.js';
import { legalDocumentsDomainErrorMappingConfiguration } from '../src/legal-documents/application/http-error-mapper-configuration.js';
import { llmDomainErrorMappingConfiguration } from '../src/llm/application/http-error-mapper-configuration.js';
import { maddoDomainErrorMappingConfiguration } from '../src/maddo/application/http-error-mapper-configuration.js';
import { organizationalEntitiesDomainErrorMappingConfiguration } from '../src/organizational-entities/application/http-error-mapper-configuration.js';
import { prescriptionDomainErrorMappingConfiguration } from '../src/prescription/shared/application/http-error-mapper-configuration.js';
import { stagesDomainErrorMappingConfiguration } from '../src/prescription/stages/application/http-error-mapper-configuration.js';
import { profileDomainErrorMappingConfiguration } from '../src/profile/application/http-error-mapper-configuration.js';
import { schoolDomainErrorMappingConfiguration } from '../src/school/application/http-error-mapper-configuration.js';
import { ErrorMappingRegistry } from '../src/shared/application/errors/error-mapping-registry.js';
import { HapiErrorMapper } from '../src/shared/application/errors/hapi-error-mapper.js';
import { teamDomainErrorMappingConfiguration } from '../src/team/application/http-error-mapper-configuration.js';

const setupErrorHandling = function (server) {
  const mappings = [
    ...authenticationDomainErrorMappingConfiguration,
    ...organizationalEntitiesDomainErrorMappingConfiguration,
    ...teamDomainErrorMappingConfiguration,
    ...certificationDomainErrorMappingConfiguration,
    ...devcompDomainErrorMappingConfiguration,
    ...evaluationDomainErrorMappingConfiguration,
    ...stagesDomainErrorMappingConfiguration,
    ...legalDocumentsDomainErrorMappingConfiguration,
    ...llmDomainErrorMappingConfiguration,
    ...prescriptionDomainErrorMappingConfiguration,
    ...schoolDomainErrorMappingConfiguration,
    ...profileDomainErrorMappingConfiguration,
    ...maddoDomainErrorMappingConfiguration,
  ];

  const registry = new ErrorMappingRegistry();
  registry.register(mappings);

  const mapper = new HapiErrorMapper(registry);
  server.ext('onPreResponse', (...args) => mapper.handle(...args));
};

export { setupErrorHandling };
