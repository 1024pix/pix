import { learningContentController } from '../../../../src/learning-content/application/learning-content-controller.js';
import * as moduleUnderTest from '../../../../src/learning-content/application/learning-content-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Route | learning-content-route', function () {
  let httpTestServer;

  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
    sinon.stub(learningContentController, 'patchCacheEntry').callsFake((request, h) => h.response().code(204));
    sinon.stub(learningContentController, 'createRelease').callsFake((request, h) => h.response().code(204));
    sinon.stub(learningContentController, 'refreshCache').callsFake((request, h) => h.response().code(204));
    httpTestServer = new HttpTestServer();
    httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/lcms/releases', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/lcms/releases');

      // then
      expect(response.statusCode).to.equal(204);
      expect(learningContentController.createRelease).to.have.been.called;
    });
  });

  describe('PATCH /api/cache/{model}/{id}', function () {
    describe('Resource access management', function () {
      it('should respond with a 400 - bad request - if model in params in not amongst allowed values', async function () {
        // given
        const response = await httpTestServer.request(
          'PATCH',
          '/api/cache/chocolats/recXYZ1234',
          {
            id: 'recChallengeId',
            param: 'updatedModelParam',
          },
          null,
          { authorization: 'some.access.token' },
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('nominal case', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        'frameworks',
        'areas',
        'competences',
        'thematics',
        'tubes',
        'skills',
        'challenges',
        'tutorials',
        'courses',
      ].forEach((modelName) => {
        it('should reach the controller', async function () {
          // given
          const response = await httpTestServer.request(
            'PATCH',
            `/api/cache/${modelName}/recXYZ1234`,
            {
              id: 'recChallengeId',
              param: 'updatedModelParam',
            },
            null,
            { authorization: 'some.access.token' },
          );

          // then
          expect(response.statusCode).to.equal(204);
          expect(learningContentController.patchCacheEntry).to.have.been.calledOnce;
        });
      });
    });
  });

  describe('PATCH /api/cache', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('PATCH', '/api/cache');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
