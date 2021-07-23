import postCampaignParticipation from './post-campaign-participation';
import shareCampaignParticipation from './share-campaign-participation';

export default function index(config) {
  config.post('/campaign-participations', postCampaignParticipation);

  config.patch('/campaign-participations/:id', shareCampaignParticipation);
}
