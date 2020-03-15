import getCampaignParticipation from './get-campaign-participation';
import postCampaignParticipation from './post-campaign-participation';
import shareCampaignParticipation from './share-campaign-participation';

export default function index(config) {
  config.get('/campaign-participations', getCampaignParticipation);
  config.post('/campaign-participations', postCampaignParticipation);

  config.patch('/campaign-participations/:id', shareCampaignParticipation);
}
