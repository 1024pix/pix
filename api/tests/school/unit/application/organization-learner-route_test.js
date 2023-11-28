import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { organizationLearnerController } from '../../../../src/school/application/organization-learner-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/organization-learner-route.js';

describe('Unit | Router | organization-learner-router', function () {
  describe('GET /api/pix1d/organization-learners/:id', function () {
    it('should return 200 if the school is found', async function () {
      // given
      sinon.stub(organizationLearnerController, 'getById').callsFake((request, h) => h.response('ok'));

      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/organization-learners/34');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
