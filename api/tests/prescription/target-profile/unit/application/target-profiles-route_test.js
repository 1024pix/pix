import sinon from 'sinon';

import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/target-profile-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Target Profiles | Application | Routes', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
    sinon
      .stub(targetProfileController, 'findLearningContentsByOrganizationId')
      .callsFake((request, h) => h.response('ok'));
  });

  describe('GET /api/organizations/{organizationId}/frameworks', function () {
    const method = 'GET';
    const url = '/api/organizations/123/frameworks';
    const payload = null;

    it('should called controller findLearningContentsByOrganizationId', async function () {
      // given
      securityPreHandlers.checkUserBelongsToOrganization.callsFake(() => (request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(targetProfileController.findLearningContentsByOrganizationId.called).to.be.true;
    });

    it('should not called findLearningContentsByOrganizationId', async function () {
      // given
      securityPreHandlers.checkUserBelongsToOrganization.callsFake((_, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(targetProfileController.findLearningContentsByOrganizationId.called).to.be.false;
    });
  });
});
