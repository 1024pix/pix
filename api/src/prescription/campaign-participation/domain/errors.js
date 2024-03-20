import { DomainError } from '../../../shared/domain/errors.js';

class CampaignParticipationDeletedError extends DomainError {
  constructor(message = 'La participation est supprimée.') {
    super(message);
  }
}

export { CampaignParticipationDeletedError };
