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
        'is-relevant': null,
        program: 'Programme du contenu formatif',
        objectives: [],
        description: "<p>Voici la description d'un contenu formatif</p>",
      });
    });
  });

  describe('PATCH /api/campaign-participations/{campaignParticipationId}/trainings/{trainingId}', function () {
    it('should return 204 when the userRecommendedTraining exists', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId: user.id });
      const training = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId: user.id,
        trainingId: training.id,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipation.id}/trainings/${training.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              'is-relevant': true,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 when the userRecommendedTraining does not exist', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId: user.id });
      const training = databaseBuilder.factory.buildTraining();
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipation.id}/trainings/${training.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              'is-relevant': false,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return 401 when the user is not authenticated', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: `/api/campaign-participations/1/trainings/1`,
        payload: {
          data: {
            attributes: {
              'is-relevant': true,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
