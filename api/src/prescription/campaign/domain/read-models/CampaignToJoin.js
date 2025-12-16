import { Campaign } from '../models/Campaign.js';

class CampaignToJoin extends Campaign {
  constructor({
    identityProvider,
    targetProfileName,
    targetProfileImageUrl,
    targetProfileIsSimplifiedAccess,
    ...campaignAttributes
  } = {}) {
    super(campaignAttributes);

    this.targetProfileName = targetProfileName;
    this.targetProfileImageUrl = targetProfileImageUrl;
    this.isSimplifiedAccess = targetProfileIsSimplifiedAccess;

    this.identityProvider = identityProvider;

    this.reconciliationFields = null;
  }

  /*  get isReconciliationRequired() {
    return this.isRestricted && Array.isArray(this.reconciliationFields);
  }
 */
  setReconciliationFields(reconciliationFields) {
    this.reconciliationFields = reconciliationFields;
  }
}

export { CampaignToJoin };
