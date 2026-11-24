import { Campaign } from '../models/Campaign.js';

class CampaignToJoin extends Campaign {
  constructor({
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
    ...campaignAttributes
  } = {}) {
    super(campaignAttributes);
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationLogoUrl = organizationLogoUrl;
    this.organizationShowNPS = organizationShowNPS;
    this.organizationFormNPSUrl = organizationFormNPSUrl;

    this.targetProfileName = targetProfileName;
    this.targetProfileImageUrl = targetProfileImageUrl;
    this.isSimplifiedAccess = targetProfileIsSimplifiedAccess;

    this.identityProvider = identityProvider;

    this.isRestricted = organizationIsManagingStudents || hasLearnersImportFeature;
    this.reconciliationFields = null;
  }

  get isReconciliationRequired() {
    return this.isRestricted && Array.isArray(this.reconciliationFields);
  }

  setReconciliationFields(reconciliationFields) {
    this.reconciliationFields = reconciliationFields;
  }
}

export { CampaignToJoin };
