import { Assessment } from '../../../src/shared/domain/models/Assessment.js';
import { CampaignTypes } from '../../../src/prescription/shared/domain/constants.js';
import { config } from '../../config.js';

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
    type,
    isForAbsoluteNovice,
    organizationId,
    organizationName,
    organizationType,
    organizationLogoUrl,
    organizationIsManagingStudents,
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
    this.isRestricted = organizationIsManagingStudents;
    this.isSimplifiedAccess = targetProfileIsSimplifiedAccess;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.organizationId = organizationId;
    this.organizationName =
      organizationId === config.autonomousCourse.autonomousCoursesOrganizationId ? 'Pix' : organizationName;
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
  }

  get isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  get isProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  get isFlash() {
    return this.assessmentMethod === Assessment.methods.FLASH;
  }
}

export { CampaignToJoin };
