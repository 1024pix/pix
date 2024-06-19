import { registrationOrganizationLearnerController } from '../../../../../src/prescription/organization-learner/application/registration-organization-learner-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/registration-organization-learner-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | organization-learner-router', function () {
  describe('GET /api/organization-learners', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon
        .stub(registrationOrganizationLearnerController, 'findAssociation')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners?userId=1&campaignCode=ABCDEF123';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
