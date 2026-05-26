import { createServer } from '../../../../../server.js';
import { Training } from '../../../../../src/devcomp/domain/models/Training.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Campaign Participations', function () {
  let server, user;

  beforeEach(async function () {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
  });

  describe('GET /api/campaign-participations/{id}/trainings', function () {
    it('should return the campaign-participation trainings', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId: campaignParticipation.userId,
        trainingId: training.id,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}/trainings`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal('trainings');
      expect(response.result.data[0].attributes).to.deep.equal({
        duration: { days: 0, hours: 6, minutes: 0 },
        link: training.link,
        locales: training.locales,
        title: training.title,
        type: training.type,
        'editor-name': training.editorName,
        'editor-logo-url': training.editorLogoUrl,
        'delivery-mode': Training.modes.HYBRID,
        'registration-required': false,
        program: 'Programme du contenu formatif',
        objectives: [],
        description: "<p>Voici la description d'un contenu formatif</p>",
      });
    });
  });
});
