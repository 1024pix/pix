import { createServer } from '../../../../../server.js';
import { Training } from '../../../../../src/devcomp/domain/models/Training.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Routes | UserTrainingsRoute', function () {
  let options;
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({}).id;

    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: `/api/users/${userId}/trainings`,
      payload: {},
      headers: generateAuthenticatedUserRequestHeaders({ userId }),
    };
    server = await createServer();
  });

  describe('GET /users/:id/trainings', function () {
    it('should return 200', async function () {
      //given
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ userId });
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId,
        campaignParticipationId,
        isRelevant: false,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'trainings',
          id: `${trainingId}`,
          attributes: {
            duration: { days: 0, hours: 6, minutes: 0 },
            link: 'http://mon-link.com',
            locales: ['fr-fr'],
            objectives: [],
            program: 'Programme du contenu formatif',
            'registration-required': false,
            'delivery-mode': Training.modes.HYBRID,
            title: 'title',
            type: 'webinaire',
            'editor-name': "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
            'editor-logo-url':
              'https://assets.pix.org/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
            description: "<p>Voici la description d'un contenu formatif</p>",
            'is-relevant': false,
          },
          relationships: {
            'target-profile-summaries': {
              links: {
                related: `/api/admin/trainings/${trainingId}/target-profile-summaries`,
              },
            },
          },
        },
      ]);
      expect(response.result.meta).to.deep.equal({
        pagination: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
      });
    });
  });
});
