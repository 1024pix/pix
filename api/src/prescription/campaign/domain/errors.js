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

class IsForAbsoluteNoviceUpdateError extends DomainError {
  constructor(message = 'Update isForAbsoluteNovice campaign unauthorized') {
    super(message);
    this.code = 'IS_FOR_ABSOLUTE_NOVICE_UPDATE_FORBIDDEN';
  }
}

class MultipleSendingsUpdateError extends DomainError {
  constructor(message = 'Update multipleSending campaign unauthorized, has already participations') {
    super(message);
    this.code = 'CANT_UPDATE_ATTRIBUTE_WHEN_CAMPAIGN_HAS_PARTICIPATIONS';
  }
}

export {
  UnknownCampaignId,
  SwapCampaignMismatchOrganizationError,
  IsForAbsoluteNoviceUpdateError,
  MultipleSendingsUpdateError,
};
