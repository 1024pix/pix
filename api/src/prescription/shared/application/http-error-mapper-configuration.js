import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import { campaignDomainErrorMappingConfiguration } from '../../campaign/application/http-error-mapper-configuration.js';

const prescriptionDomainErrorMappingConfiguration = [...campaignDomainErrorMappingConfiguration].map(
  (domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration),
);

export { prescriptionDomainErrorMappingConfiguration };
