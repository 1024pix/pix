const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-find-paginated-user-recommended-trainings', function () {
  let options;
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({}).id;
    const authorization = generateValidRequestAuthorizationHeader(userId);

    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: `/api/users/${userId}/trainings`,
      payload: {},
      headers: { authorization },
    };
    server = await createServer();
  });

  describe('GET /users/:id/trainings', function () {
    it('should return 200', async function () {
      //given
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ userId });
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({ userId, trainingId, campaignParticipationId });
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
            locale: 'fr-fr',
            title: 'title',
            type: 'webinaire',
            'editor-name': "Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
            'editor-logo-url':
              'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
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
