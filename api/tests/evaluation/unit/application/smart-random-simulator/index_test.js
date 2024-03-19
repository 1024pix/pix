import * as algorithmSimulatorRouter from '../../../../../src/evaluation/application/smart-random-simulator/index.js';
import { smartRandomSimulatorController } from '../../../../../src/evaluation/application/smart-random-simulator/smart-random-simulator-controller.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | smart-random-simulator', function () {
  describe('POST /api/admin/smart-random-simulator/get-next-challenge', function () {
    it('should return 200', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/smart-random-simulator/get-next-challenge';
      const payload = {
        data: {
          attributes: {
            knowledgeElements: [
              {
                source: 'direct',
                status: 'validated',
                answerId: 12345678,
                skillId: 'rec45678765',
              },
            ],
            answers: [
              {
                id: '12345',
                result: 'ok',
                challengeId: 'rec1234567',
              },
            ],
            skills: [
              {
                id: 'recoaijndozia123',
                difficulty: 3,
                name: '@skillname3',
              },
            ],
            challenges: [
              {
                id: 'challengerec1234567',
                skill: {
                  id: 'recoaijndozia123',
                  name: '@skillname3',
                  difficulty: 3,
                },
                locales: ['fr-fr'],
              },
            ],
            locale: 'fr-fr',
            assessmentId: 12346,
          },
        },
      };

      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
        ])
        .callsFake(() => (request, h) => h.response(true));
      sinon
        .stub(smartRandomSimulatorController, 'getNextChallenge')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(algorithmSimulatorRouter);

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
    });
  });
});
