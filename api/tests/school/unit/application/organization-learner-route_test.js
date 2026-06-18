import sinon from 'sinon';

import { organizationLearnerController } from '../../../../src/school/application/organization-learner-controller.js';
import { organizationLearnerRoute as moduleUnderTest } from '../../../../src/school/application/organization-learner-route.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Unit | Router | organization-learner-router', function () {
  describe('GET /api/pix1d/organization-learners/:id', function () {
    it('should return 200 if the school is found', async function () {
      // given
      sinon.stub(organizationLearnerController, 'getById').callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/organization-learners/34');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
