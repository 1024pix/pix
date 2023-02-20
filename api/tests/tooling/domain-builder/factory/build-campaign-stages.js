import CampaignStages from '../../../../lib/domain/read-models/campaign/CampaignStages';

export default function buildCampaignStages({ stages = [] } = {}) {
  return new CampaignStages({ stages });
}
