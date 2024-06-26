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

class CampaignUniqueCodeError extends DomainError {
  constructor(message = "Campaign's code must be unique") {
    super(message);
    this.code = 'CAMPAIGN_CODE_NOT_UNIQUE';
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
class CampaignCodeFormatError extends DomainError {
  constructor(message = "Campaign's should contains invalid char. Only uppercase alphanumeric char are allowed ") {
    super(message);
    this.code = 'CAMPAIGN_CODE_BAD_FORMAT';
  }
}

class ArchivedCampaignError extends DomainError {
  constructor(message = 'Cette campagne est déjà archivée.') {
    super(message);
  }
}

class DeletedCampaignError extends DomainError {
  constructor(message = 'Cette campagne est déjà supprimée.') {
    super(message);
  }
}

export {
  ArchivedCampaignError,
  CampaignCodeFormatError,
  CampaignUniqueCodeError,
  DeletedCampaignError,
  IsForAbsoluteNoviceUpdateError,
  MultipleSendingsUpdateError,
  SwapCampaignMismatchOrganizationError,
  UnknownCampaignId,
};
