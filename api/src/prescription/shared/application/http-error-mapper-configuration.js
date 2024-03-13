import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import { campaignDomainErrorMappingConfiguration } from '../../campaign/application/http-error-mapper-configuration.js';
import { learnerManagementDomainErrorMappingConfiguration } from '../../learner-management/application/http-error-mapper-configuration.js';

const prescriptionDomainErrorMappingConfiguration = []
  .concat(campaignDomainErrorMappingConfiguration)
  .concat(learnerManagementDomainErrorMappingConfiguration)
  .map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { prescriptionDomainErrorMappingConfiguration };
