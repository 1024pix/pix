import lodash from 'lodash';

import { CampaignTypes } from '../../../shared/domain/constants.js';

const { countBy } = lodash;

class OrganizationLearnerActivity {
  constructor({ organizationLearnerId, participations }) {
    this.organizationLearnerId = organizationLearnerId;
    this.participations = participations;
    this.statistics = this.#statistics(participations);
  }

  #getStatisticsForType(participations, campaignType) {
    const participationsForCampaignType = participations.filter(
      (participation) => participation.campaignType === campaignType,
    );

    const { SHARED = 0, TO_SHARE = 0, STARTED = 0 } = countBy(participationsForCampaignType, 'status');

    return {
      campaignType,
      shared: SHARED,
      // TODO Remove TO_SHARE status once not used anymore
      started: TO_SHARE + STARTED,
      total: participationsForCampaignType.length,
    };
  }

  #statistics(participations) {
    return [CampaignTypes.ASSESSMENT, CampaignTypes.PROFILES_COLLECTION].map((campaignType) =>
      this.#getStatisticsForType(participations, campaignType),
    );
  }
}

export { OrganizationLearnerActivity };
