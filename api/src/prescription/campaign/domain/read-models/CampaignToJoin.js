import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { CampaignTypes } from '../../../shared/domain/constants.js';

class CampaignToJoin {
  constructor({
    id,
    code,
    title,
    idPixLabel,
    customLandingPageText,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    archivedAt,
    deletedAt,
    type,
    isForAbsoluteNovice,
    organizationId,
    organizationName,
    organizationType,
    organizationLogoUrl,
    organizationIsManagingStudents,
    hasLearnersImportFeature,
    identityProvider,
    organizationShowNPS,
    organizationFormNPSUrl,
    targetProfileName,
    targetProfileImageUrl,
    targetProfileIsSimplifiedAccess,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  } = {}) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.customLandingPageText = customLandingPageText;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.archivedAt = archivedAt;
    this.deletedAt = deletedAt;
    this.isSimplifiedAccess = targetProfileIsSimplifiedAccess;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationLogoUrl = organizationLogoUrl;
    this.identityProvider = identityProvider;
    this.organizationShowNPS = organizationShowNPS;
    this.organizationFormNPSUrl = organizationFormNPSUrl;
    this.targetProfileName = targetProfileName;
    this.targetProfileImageUrl = targetProfileImageUrl;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;

    this.isRestricted = organizationIsManagingStudents || hasLearnersImportFeature;
  }

  get isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  get isProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  get isAccessible() {
    if (Boolean(this.archivedAt) || Boolean(this.deletedAt)) {
      return false;
    }
    return true;
  }

  get isFlash() {
    return this.assessmentMethod === Assessment.methods.FLASH;
  }
}

export { CampaignToJoin };
