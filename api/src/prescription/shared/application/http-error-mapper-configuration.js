import { PreconditionFailedError } from '../../../shared/application/errors/http-errors.js';
import { campaignDomainErrorMappingConfiguration } from '../../campaign/application/http-error-mapper-configuration.js';
import { learnerManagementDomainErrorMappingConfiguration } from '../../learner-management/application/http-error-mapper-configuration.js';
import { ArchivedCampaignError } from '../domain/errors.js';

const sharedDomainErrorMappingConfiguration = [
  {
    name: ArchivedCampaignError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
];

const prescriptionDomainErrorMappingConfiguration = sharedDomainErrorMappingConfiguration
  .concat(campaignDomainErrorMappingConfiguration)
  .concat(learnerManagementDomainErrorMappingConfiguration);

export { prescriptionDomainErrorMappingConfiguration };
