import { ObjectValidationError } from '../../../../shared/domain/errors.js';
import { CampaignTypes } from '../../../shared/domain/constants.js';
import {
  ArchivedCampaignError,
  CampaignCodeFormatError,
  DeletedCampaignError,
  IsForAbsoluteNoviceUpdateError,
  MultipleSendingsUpdateError,
} from '../errors.js';

class Campaign {
  constructor({
    id,
    name,
    code,
    organizationId,
    creatorId,
    createdAt,
    targetProfileId,
    idPixLabel,
    title,
    customLandingPageText,
    type,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    isForAbsoluteNovice,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
    ownerId,
    archivedAt,
    archivedBy,
    deletedAt = null,
    deletedBy = null,
    participationCount,
  } = {}) {
    this.id = id;
    this.code = code;
    this.idPixLabel = idPixLabel;
    this.name = name;
    this.title = title;
    this.type = type;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.customLandingPageText = customLandingPageText;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;

    this.ownerId = ownerId;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
    this.creatorId = creatorId;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    this.hasParticipation = participationCount > 0;
  }

  isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  isProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  isArchived() {
    return Boolean(this.archivedAt);
  }

  get isDeleted() {
    return Boolean(this.deletedAt);
  }

  delete(userId) {
    if (this.deletedAt) {
      throw new DeletedCampaignError();
    }
    if (!userId) {
      throw new ObjectValidationError('userId Missing');
    }

    this.deletedAt = new Date();
    this.deletedBy = userId;
  }

  archive(archivedAt, archivedBy) {
    if (this.archivedAt) {
      throw new ArchivedCampaignError();
    }
    if (!archivedAt) {
      throw new ObjectValidationError('ArchivedAt Missing');
    }
    if (!archivedBy) {
      throw new ObjectValidationError('ArchivedBy Missing');
    }

    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
  }

  unarchive() {
    this.archivedAt = null;
    this.archivedBy = null;
  }

  #validateCode(code) {
    return /^[A-Z0-9]{9}$/.test(code);
  }

  updateFields(fields, isAuthorizedToUpdateIsForAbsoluteNovice) {
    if (fields.code !== undefined && fields.code !== this.code && !this.#validateCode(fields.code)) {
      throw new CampaignCodeFormatError();
    }

    if (
      fields.multipleSendings !== undefined &&
      fields.multipleSendings !== this.multipleSendings &&
      this.hasParticipation > 0
    ) {
      throw new MultipleSendingsUpdateError();
    }

    if (
      !isAuthorizedToUpdateIsForAbsoluteNovice &&
      fields.isForAbsoluteNovice !== undefined &&
      fields.isForAbsoluteNovice !== this.isForAbsoluteNovice
    ) {
      throw new IsForAbsoluteNoviceUpdateError();
    }

    Object.entries(fields).forEach((entry) => {
      const [key, value] = entry;

      if (this[key] !== undefined && value !== undefined) {
        this[key] = value;
      }
    });
  }
}

export { Campaign };
