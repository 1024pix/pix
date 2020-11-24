const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/users');

describe('Integration | Application | Users | user-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sandbox.stub(securityPreHandlers, 'checkUserHasRolePixMaster');

    sandbox.stub(usecases, 'getUserCampaignParticipationToCampaign');
    sandbox.stub(usecases, 'getUserProfileSharedForCampaign');
    sandbox.stub(usecases, 'addGarAuthenticationMethodToUser');
    sandbox.stub(usecases, 'dissociateSchoolingRegistrations');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getUserCampaignParticipationToCampaign', () => {

    const auth = { credentials: {}, strategy: {} };

    context('Success cases', () => {

      const campaignParticipation = domainBuilder.buildCampaignParticipation();

      beforeEach(() => {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
        auth.credentials.userId = '1234';
      });

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.getUserCampaignParticipationToCampaign.resolves(campaignParticipation);

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/campaign-participations', null, auth);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should return a 403 HTTP response', async () => {
        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/campaign-participations');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('#getUserProfileSharedForCampaign', () => {

    context('Error cases', () => {

      it('should return a 403 HTTP response', async () => {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/profile');

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return a 401 HTTP response', async () => {
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

  describe('#dissociateSchoolingRegistrations', () => {

    const method = 'PATCH';
    const url = '/api/admin/users/1/dissociate';

    beforeEach(() => {
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
    });

    context('Success cases', () => {

      it('should return a HTTP response with status code 200', async () => {
        // given
        usecases.dissociateSchoolingRegistrations.resolves(domainBuilder.buildUserDetailsForAdmin());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      it('should return a 403 HTTP response when when user is not allowed to access resource', async () => {
        // given
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
