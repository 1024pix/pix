import postCampaignParticipation from './post-campaign-participation';
import getCampaignParticipation from './get-campaign-participation';
import shareCampaignParticipation from './share-campaign-participation';

export default function index(config) {
  config.post('/campaign-participations', postCampaignParticipation);
  config.get('/campaign-participations', getCampaignParticipation);
  config.patch('/campaign-participations/:id', shareCampaignParticipation);
}
