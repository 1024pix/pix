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

    this.targetProfileName = targetProfileName;
    this.targetProfileImageUrl = targetProfileImageUrl;

    this.customLandingPageText = customLandingPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.customResultPageText = customResultPageText;

    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.idPixLabel = idPixLabel;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.isSimplifiedAccess = targetProfileIsSimplifiedAccess;
    this.isForAbsoluteNovice = isForAbsoluteNovice;

    this.identityProvider = identityProvider;

    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationLogoUrl = organizationLogoUrl;
    this.organizationShowNPS = organizationShowNPS;
    this.organizationFormNPSUrl = organizationFormNPSUrl;

    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;

    this.isRestricted = organizationIsManagingStudents || hasLearnersImportFeature;
    this.archivedAt = archivedAt;
    this.deletedAt = deletedAt;

    this.reconciliationFields = null;
  }

  get isReconciliationRequired() {
    return this.isRestricted && Array.isArray(this.reconciliationFields);
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

  setReconciliationFields(reconciliationFields) {
    this.reconciliationFields = reconciliationFields;
  }
}

export { CampaignToJoin };
