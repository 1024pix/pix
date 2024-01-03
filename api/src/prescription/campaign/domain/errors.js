import { DomainError } from '../../../shared/domain/errors.js';

class UnknownCampaignId extends DomainError {
  constructor(message = 'Campaign id does not exists') {
    super(message);
    this.code = 'UNKNOWN_CAMPAIGN_ID';
  }
}

export { UnknownCampaignId };
