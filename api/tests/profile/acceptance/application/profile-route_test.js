import { createServer } from '../../../../server.js';
import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Profile | Acceptance | Router | profile-route', function () {
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
    server = await createServer();
  });

  describe('GET /admin/users/:id/profile', function () {
    describe('Success case', function () {
      it("should return user's serialized scorecards", async function () {
        // given
        const competenceId = 'recCompetence';
        const area = {
          id: 'recvoGdo7z2z7pXWa',
          title_i18n: { fr: 'Information et données' },
          color: 'jaffa',
          code: '1',
          competenceIds: [competenceId],
        };
        databaseBuilder.factory.learningContent.build({
          areas: [area],
          competences: [
            {
              id: competenceId,
              name_i18n: { fr: 'Mener une recherche et une veille d’information' },
              description_i18n: { fr: 'Une description' },
              index: '1.1',
              origin: 'Pix',
              areaId: 'recvoGdo7z2z7pXWa',
            },
          ],
          skills: [
            {
              id: 'recAcquisWeb1',
              name: '@web1',
              status: 'actif',
              competenceId: competenceId,
            },
          ],
        });

        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competenceId,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competenceId,
        });

        const superAdminUser = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${userId}/profile`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdminUser.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal({
          id: userId.toString(),
          type: 'Profiles',
          attributes: {
            'pix-score': knowledgeElement.earnedPix,
            'max-reachable-level': MAX_REACHABLE_LEVEL,
            'max-reachable-pix-score': MAX_REACHABLE_PIX_SCORE,
          },
          relationships: {
            scorecards: {
              data: [
                {
                  id: `${userId}_${competenceId}`,
                  type: 'scorecards',
                },
              ],
            },
          },
        });

        expect(response.result.included).to.deep.equal([
          {
            attributes: {
              code: area.code,
              title: area.title_i18n.fr,
              color: area.color,
            },
            id: area.id,
            type: 'areas',
          },
          {
            attributes: {
              'competence-id': 'recCompetence',
              description: 'Une description',
              'earned-pix': 2,
              'has-not-earned-anything': false,
              'has-not-reached-level-one': true,
              'has-reached-at-least-level-one': false,
              index: '1.1',
              'is-finished': false,
              'is-finished-with-max-level': false,
              'is-improvable': false,
              'is-max-level': false,
              'is-not-started': false,
              'is-progressable': true,
              'is-resettable': true,
              'is-started': true,
              level: 0,
              name: 'Mener une recherche et une veille d’information',
              'percentage-ahead-of-next-level': 25,
              'pix-score-ahead-of-next-level': 2,
              'remaining-days-before-improving': 0,
              'remaining-days-before-reset': 0,
              'remaining-pix-to-next-level': 6,
              'should-wait-before-improving': false,
              status: 'STARTED',
            },
            id: `${userId}_${competenceId}`,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas',
                },
              },
            },
          },
        ]);
      });
    });

    describe('Ressource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${userId}/profile`,
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not admin', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${userId}/profile`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /users/:id/profile', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/users/' + userId + '/profile',
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = databaseBuilder.factory.buildUser({}).id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/users/' + otherUserId + '/profile',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it("should return user's serialized scorecards", async function () {
        // given
        const competenceId = 'recCompetence';
        const area = {
          id: 'recvoGdo7z2z7pXWa',
          title_i18n: { fr: 'Information et données' },
          color: 'jaffa',
          code: '1',
          competenceIds: [competenceId],
        };
        databaseBuilder.factory.learningContent.build({
          areas: [area],
          competences: [
            {
              id: competenceId,
              name_i18n: { fr: 'Mener une recherche et une veille d’information' },
              description_i18n: { fr: 'Une description' },
              index: '1.1',
              origin: 'Pix',
              areaId: 'recvoGdo7z2z7pXWa',
            },
          ],
          skills: [
            {
              id: 'recAcquisWeb1',
              name: '@web1',
              status: 'actif',
              competenceId: competenceId,
            },
          ],
        });

        const knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competenceId,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competenceId,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/users/' + userId + '/profile',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal({
          id: userId.toString(),
          type: 'Profiles',
          attributes: {
            'pix-score': knowledgeElement.earnedPix,
            'max-reachable-level': MAX_REACHABLE_LEVEL,
            'max-reachable-pix-score': MAX_REACHABLE_PIX_SCORE,
          },
          relationships: {
            scorecards: {
              data: [
                {
                  id: `${userId}_${competenceId}`,
                  type: 'scorecards',
                },
              ],
            },
          },
        });
        expect(response.result.included).to.deep.equal([
          {
            attributes: {
              code: area.code,
              title: area.title_i18n.fr,
              color: area.color,
            },
            id: area.id,
            type: 'areas',
          },
          {
            attributes: {
              'competence-id': 'recCompetence',
              description: 'Une description',
              'earned-pix': 2,
              'has-not-earned-anything': false,
              'has-not-reached-level-one': true,
              'has-reached-at-least-level-one': false,
              index: '1.1',
              'is-finished': false,
              'is-finished-with-max-level': false,
              'is-improvable': false,
              'is-max-level': false,
              'is-not-started': false,
              'is-progressable': true,
              'is-resettable': true,
              'is-started': true,
              level: 0,
              name: 'Mener une recherche et une veille d’information',
              'percentage-ahead-of-next-level': 25,
              'pix-score-ahead-of-next-level': 2,
              'remaining-days-before-improving': 0,
              'remaining-days-before-reset': 0,
              'remaining-pix-to-next-level': 6,
              'should-wait-before-improving': false,
              status: 'STARTED',
            },
            id: `${userId}_${competenceId}`,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas',
                },
              },
            },
          },
        ]);
      });
    });
  });
});
