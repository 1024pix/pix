import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/target-profile-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Target Profiles | Application | Routes', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkUserIsMemberOfAnOrganization');
    sinon
      .stub(targetProfileController, 'getFrameworksForTargetProfileSubmission')
      .callsFake((request, h) => h.response('ok'));
  });

  describe('GET /api/frameworks/for-target-profile-submission', function () {
    const method = 'GET';
    const url = '/api/frameworks/for-target-profile-submission';
    const payload = null;

    it('should called controller getFrameworksForTargetProfileSubmission', async function () {
      // given
      securityPreHandlers.checkUserIsMemberOfAnOrganization.callsFake(() => (request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(targetProfileController.getFrameworksForTargetProfileSubmission.called).to.be.true;
    });

    it('should not called getFrameworksForTargetProfileSubmission', async function () {
      // given
      securityPreHandlers.checkUserIsMemberOfAnOrganization.callsFake((_, h) =>
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
      expect(targetProfileController.getFrameworksForTargetProfileSubmission.called).to.be.false;
    });
  });
});
