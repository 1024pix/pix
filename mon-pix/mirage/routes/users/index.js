import getAuthenticatedUser from './get-authenticated-user';
import getCertificationProfile from './get-certification-profile';
import getPixScore from './get-pix-score';
import getScorecards from './get-scorecards';
import getUserCampaignParticipations from './get-user-campaign-participations';
import resetScorecard from './reset-scorecard';

export default function index(config) {
  config.post('/users');
  config.get('/users/me', getAuthenticatedUser);
  config.get('/users/:id/certification-profile', getCertificationProfile);
  config.get('/users/:id/pixscore', getPixScore);
  config.get('/users/:id/scorecards', getScorecards);
  config.get('/users/:id/campaign-participations', getUserCampaignParticipations);
  config.post('/users/:userId/competences/:competenceId/reset', resetScorecard);
}
