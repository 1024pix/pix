import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/learner-participation-route.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Campaign-participation | learner-participation-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');

    sinon.stub(usecases, 'getUserProfileSharedForCampaign');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#getUserProfileSharedForCampaign', function () {
    context('Error cases', function () {
      it('should return a 403 HTTP response', async function () {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/profile');

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return a 401 HTTP response', async function () {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(401).takeover());
        });

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/profile');

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
