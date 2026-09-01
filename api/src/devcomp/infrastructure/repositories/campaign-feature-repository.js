import { CAMPAIGN_FEATURES } from '../../../shared/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const getHighlightedTrainingsForCampaign = async function ({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignFeature = await knexConn('campaign-features')
    .select('params')
    .join('features', 'features.id', 'campaign-features.featureId')
    .where({ campaignId, 'features.key': CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key })
    .first();
  return campaignFeature?.params?.highlightedTrainingIds ?? [];
};

export { getHighlightedTrainingsForCampaign };
