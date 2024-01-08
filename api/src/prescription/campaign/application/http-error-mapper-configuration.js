import { HttpErrors } from '../../../shared/application/http-errors.js';
import { UnknownCampaignId, SwapCampaignMismatchOrganizationError } from '../../campaign/domain/errors.js';

const campaignDomainErrorMappingConfiguration = [
  {
    name: UnknownCampaignId.name,
    httpErrorFn: (error) => {
      return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: SwapCampaignMismatchOrganizationError.name,
    httpErrorFn: (error) => new HttpErrors.ForbiddenError(error.message, error.code, error.meta),
  },
];

export { campaignDomainErrorMappingConfiguration };
