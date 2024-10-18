import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import { campaignDomainErrorMappingConfiguration } from '../../campaign/application/http-error-mapper-configuration.js';
import { learnerManagementDomainErrorMappingConfiguration } from '../../learner-management/application/http-error-mapper-configuration.js';
import { targetProfileDomainErrorMappingConfiguration } from '../../target-profile/application/http-error-mapper-configuration.js';

const prescriptionDomainErrorMappingConfiguration = []
  .concat(campaignDomainErrorMappingConfiguration)
  .concat(learnerManagementDomainErrorMappingConfiguration)
  .concat(targetProfileDomainErrorMappingConfiguration)
  .map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { prescriptionDomainErrorMappingConfiguration };
