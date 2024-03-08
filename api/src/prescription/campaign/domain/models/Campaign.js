import { CampaignTypes } from '../../../shared/domain/constants.js';
import { IsForAbsoluteNoviceUpdateError, MultipleSendingsUpdateError } from '../errors.js';

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
    archivedAt,
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
    archivedBy,
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
    this.archivedBy = archivedBy;
    this.archivedAt = archivedAt;
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

  updateFields(fields, isAuthorizedToUpdateIsForAbsoluteNovice) {
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
