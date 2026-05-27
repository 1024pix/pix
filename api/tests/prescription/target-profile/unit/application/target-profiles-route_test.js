import sinon from 'sinon';

import { targetProfilePreHandlers } from '../../../../../src/prescription/target-profile/application/pre-handlers.js';
import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/target-profile-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Target Profiles | Application | Routes', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
  });

  describe('GET /api/organizations/{organizationId}/target-profiles/{targetProfileId}', function () {
    const method = 'GET';
    const url = '/api/organizations/123/target-profiles/456';
    const payload = null;

    beforeEach(function () {
      sinon.stub(targetProfileController, 'getTargetProfileOverview').callsFake((request, h) => h.response('ok'));
    });

    it('should call getTargetProfileOverview in controller if prehandlers are ok', async function () {
      // given
      securityPreHandlers.checkUserBelongsToOrganization.callsFake(() => (request, h) => h.response(true));
      sinon
        .stub(targetProfilePreHandlers, 'checkTargetProfileBelongsToOrganization')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      //  when
      await httpTestServer.request(method, url, payload);

      // then
      expect(targetProfileController.getTargetProfileOverview.calledOnce).to.be.true;
    });

    context('when user does not belong to organization', function () {
      it('should return 403', async function () {
        // given
        securityPreHandlers.checkUserBelongsToOrganization.callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        //  when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).equal(403);
      });
    });

    context('when targetProfile does not belong to organization', function () {
      it('should return 403', async function () {
        // given
        securityPreHandlers.checkUserBelongsToOrganization.callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfilePreHandlers, 'checkTargetProfileBelongsToOrganization')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        //  when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).equal(403);
      });
    });
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
