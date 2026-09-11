import lodash from 'lodash';

import { CampaignTypes } from '../../../shared/domain/constants.ts';

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

    const { SHARED = 0, STARTED = 0 } = countBy(participationsForCampaignType, 'status');

    return {
      campaignType,
      shared: SHARED,
      started: STARTED,
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
