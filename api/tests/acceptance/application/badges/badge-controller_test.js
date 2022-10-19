const createServer = require('../../../../server');
const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  learningContentBuilder,
  mockLearningContent,
  knex,
} = require('../../../test-helper');

describe('Acceptance | API | Badges', function () {
  let server, options, userId, badge, badgeCriterion, skillSet;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      userId = (await insertUserWithRoleSuperAdmin()).id;

      const learningContent = [
        {
          id: 'recArea',
          competences: [
            {
              id: 'recCompetence',
              tubes: [
                {
                  id: 'recTube',
                  name: '@recSkill',
                  practicalTitle: 'Titre pratique',
                  skills: [
                    {
                      id: 'recABC123',
                      name: '@recSkill3',
                      level: 3,
                    },
                    {
                      id: 'recDEF456',
                      name: '@recSkill2',
                      level: 2,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'url_image',
        message: 'Bravo',
        title: 'titre du badge',
        key: 'clef du badge',
        isCertifiable: false,
        isAlwaysVisible: true,
      });
      badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });
      skillSet = databaseBuilder.factory.buildSkillSet({ badgeId: badge.id });

      await databaseBuilder.commit();
    });

    it('should return the badge', async function () {
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
            'is-always-visible': true,
            'image-url': 'url_image',
            message: 'Bravo',
            title: 'titre du badge',
            key: 'clef du badge',
          },
          relationships: {
            'badge-criteria': {
              data: [
                {
                  id: badgeCriterion.id.toString(),
                  type: 'badge-criteria',
                },
              ],
            },
            'skill-sets': {
              data: [
                {
                  id: skillSet.id.toString(),
                  type: 'skill-sets',
                },
              ],
            },
            'badge-partner-competences': {
              data: [
                {
                  id: skillSet.id.toString(),
                  type: 'badge-partner-competences',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'badge-criteria',
            id: badgeCriterion.id.toString(),
            attributes: {
              scope: 'CampaignParticipation',
              threshold: 50,
            },
            relationships: {
              'skill-sets': {
                data: [],
              },
              'partner-competences': {
                data: [],
              },
            },
          },
          {
            attributes: {
              'practical-title': 'Titre pratique',
            },
            id: 'recTube',
            type: 'tubes',
            relationships: {},
          },
          {
            attributes: {
              name: '@recSkill3',
              difficulty: 3,
            },
            id: 'recABC123',
            type: 'skills',
            relationships: {
              tube: {
                data: {
                  id: 'recTube',
                  type: 'tubes',
                },
              },
            },
          },
          {
            attributes: {
              name: '@recSkill2',
              difficulty: 2,
            },
            id: 'recDEF456',
            type: 'skills',
            relationships: {
              tube: {
                data: {
                  id: 'recTube',
                  type: 'tubes',
                },
              },
            },
          },
          {
            type: 'skill-sets',
            id: skillSet.id.toString(),
            attributes: {
              name: 'name',
            },
            relationships: {
              skills: {
                data: [
                  {
                    id: 'recABC123',
                    type: 'skills',
                  },
                  {
                    id: 'recDEF456',
                    type: 'skills',
                  },
                ],
              },
            },
          },
          {
            type: 'badge-partner-competences',
            id: skillSet.id.toString(),
            attributes: {
              name: 'name',
            },
            relationships: {
              skills: {
                data: [
                  {
                    id: 'recABC123',
                    type: 'skills',
                  },
                  {
                    id: 'recDEF456',
                    type: 'skills',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBadge);
    });
  });

  describe('PATCH /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      userId = (await insertUserWithRoleSuperAdmin()).id;

      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'url_image',
        message: 'Bravo',
        title: 'titre du badge',
        key: 'clef du badge',
        isCertifiable: false,
        isAlwaysVisible: true,
      });

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('badges').delete();
    });

    it('should update the existing badge', async function () {
      // given
      const badgeWithUpdatedInfo = {
        key: '1',
        title: 'titre du badge modifié',
        message: 'Message modifié',
        'alt-message': 'Message alternatif modifié',
        'image-url': 'url_image_modifiée',
        'is-certifiable': true,
        'is-always-visible': true,
        'campaign-threshold': null,
        'skill-set-threshold': null,
        'skill-set-name': '',
        'skill-set-skills-ids': null,
      };

      options = {
        method: 'PATCH',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            id: '1',
            type: 'badges',
            attributes: badgeWithUpdatedInfo,
            relationships: {
              'target-profile': {
                data: {
                  id: badge.targetProfileId,
                  type: 'target-profiles',
                },
              },
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('DELETE /api/admin/badges/{id}', function () {
    beforeEach(async function () {
      userId = (await insertUserWithRoleSuperAdmin()).id;
    });

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
      await knex('badges').delete();
    });

    it('should delete the existing badge if not associated to a badge acquisition', async function () {
      // given
      badge = databaseBuilder.factory.buildBadge({ id: 1 });
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should not delete the existing badge if associated to a badge acquisition', async function () {
      // given
      badge = databaseBuilder.factory.buildBadge({ id: 1 });
      databaseBuilder.factory.buildBadgeAcquisition({ badgeId: badge.id, userId });
      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
