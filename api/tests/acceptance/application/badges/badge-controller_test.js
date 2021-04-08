const createServer = require('../../../../server');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../../test-helper');

describe('Acceptance | API | Badges', () => {

  let server, options, userId, badge, badgeCriterion;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/admin/badges/{id}', () => {

    beforeEach(async () => {
      userId = (await insertUserWithRolePixMaster()).id;

      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'url_image',
        message: 'Bravo',
        title: 'titre du badge',
        key: 'clef du badge',
        isCertifiable: false,
      });
      badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });

      await databaseBuilder.commit();
    });

    it('should return the badge', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedBadge = {
        data: {
          type: 'badges',
          id: badge.id.toString(),
          attributes: {
            'alt-message': 'Message alternatif',
            'is-certifiable': false,
            'image-url': 'url_image',
            message: 'Bravo',
            title: 'titre du badge',
            key: 'clef du badge',
          },
          relationships: {
            'badge-criteria': {
              data: [{
                id: badgeCriterion.id.toString(),
                type: 'badge-criterion',
              }],
            },
          },
        },
        included: [{
          type: 'badge-criterion',
          id: badgeCriterion.id.toString(),
          attributes: {
            scope: 'CampaignParticipation',
            threshold: 50,
          },
        }],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBadge);
    });
  });
});
