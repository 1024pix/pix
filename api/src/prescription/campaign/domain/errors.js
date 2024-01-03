import { DomainError } from '../../../shared/domain/errors.js';

class UnknownCampaignId extends DomainError {
  constructor(message = 'Campaign id does not exists') {
    super(message);
    this.code = 'UNKNOWN_CAMPAIGN_ID';
  }
}
class SwapCampaignMismatchOrganizationError extends DomainError {
  constructor(message = 'Campaigns must be in the same organization') {
    super(message);
    this.code = 'ORGANIZATION_MISMATCH';
  }
}

export { UnknownCampaignId, SwapCampaignMismatchOrganizationError };
