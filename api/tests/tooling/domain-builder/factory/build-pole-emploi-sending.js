import { buildCampaignParticipation } from './build-campaign-participation.js';
import lodash from 'lodash';
const { isUndefined } = lodash;
import { PoleEmploiSending } from '../../../../lib/domain/models/PoleEmploiSending.js';

const buildPoleEmploiSending = function ({
  type = PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
  campaignParticipationId,
  isSuccessful = true,
  responseCode = '200',
  payload = null,
  createdAt = new Date('2020-01-01'),
} = {}) {
  campaignParticipationId = isUndefined(campaignParticipationId)
    ? buildCampaignParticipation().id
    : campaignParticipationId;

  return new PoleEmploiSending({
    campaignParticipationId,
    type,
    isSuccessful,
    responseCode,
    payload,
    createdAt,
  });
};

export { buildPoleEmploiSending };
