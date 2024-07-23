import { learnerActivityController } from '../../../../../src/prescription/organization-learner/application/learner-activity-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/learner-activity-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-router', function () {
  describe('GET /api/organization-learners/{id}/activity', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon.stub(learnerActivityController, 'getActivity').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/1/activity';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkUserBelongsToLearnersOrganization);
    });

    it('should return a HTTP status error code 403', async function () {
      // given
      sinon.stub(learnerActivityController, 'getActivity').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/1/activity';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/organization-learners/{id}', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon.stub(learnerActivityController, 'getLearner').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/77';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkUserBelongsToLearnersOrganization).to.have.been.calledBefore(
        learnerActivityController.getLearner,
      );
    });
  });
});
