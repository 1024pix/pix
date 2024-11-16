import { HttpErrors } from '../../../shared/application/http-errors.js';
import { CampaignParticiationInvalidStatus } from '../domain/errors.js';

const campaignParticipationDomainErrorMappingConfiguration = [
  {
    name: CampaignParticiationInvalidStatus.name,
    httpErrorFn: (error) => {
      return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
];

export { campaignParticipationDomainErrorMappingConfiguration };
