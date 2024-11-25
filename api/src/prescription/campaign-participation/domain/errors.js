import { DomainError } from '../../../shared/domain/errors.js';

class CampaignParticipationDeletedError extends DomainError {
  constructor(message = 'La participation est supprimée.') {
    super(message);
  }
}

class CampaignParticiationInvalidStatus extends DomainError {
  constructor(campaignParticipationId, acceptedStatus) {
    super(
      `Campaign participation: ${campaignParticipationId} status do not fulfill requirement. Accepted Status : ${acceptedStatus}`,
    );
  }
}

export { CampaignParticiationInvalidStatus, CampaignParticipationDeletedError };
