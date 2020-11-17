const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');
const { InvalidExternalUserTokenError, UnexpectedUserAccount } = require('../../../../lib/domain/errors');

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
    sandbox.stub(usecases, 'updateUserSamlId');
    sandbox.stub(usecases, 'dissociateSchoolingRegistrations');
    sandbox.stub(usecases, 'finishPixContest');

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

  describe('#updateUserSamlId', () => {

    const method = 'PATCH';
    const url = '/api/users/1/authentication-methods/saml';

    let payload;

    beforeEach(() => {
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
      payload = {
        data: {
          id: 1,
          type: 'external-users',
          attributes: {
            'external-user-token': 'TOKEN',
            'expected-user-id': 1,
          },
        },
      };
    });

    context('Success cases', () => {

      it('should return a HTTP response with status code 204', async () => {
        // given
        usecases.updateUserSamlId.resolves(domainBuilder.buildUser());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', () => {

      it('should return a 403 HTTP response when authenticated user is not authorized to update requested user', async () => {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return a 400 HTTP response when externalUserToken is missing', async () => {
        // given
        payload.data.attributes = {};

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].detail).to.equal('"data.attributes.external-user-token" is required');
      });

      it('should return a 401 HTTP response when the IdToken is invalid', async () => {
        // given
        const expectedMessageError = 'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.';
        usecases.updateUserSamlId.rejects(new InvalidExternalUserTokenError(expectedMessageError));

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal(expectedMessageError);
      });

      it('should return a 409 HTTP response when the authentified user does not match the expected one', async () => {
        // given
        const expectedMessageError = 'Ce compte utilisateur n\'est pas celui qui est attendu.';
        const expectedCode = 'EXPECTED_CODE';
        const expectedMeta = { value: 'obfuscatedEmail' };
        usecases.updateUserSamlId.rejects(new UnexpectedUserAccount({ code: expectedCode, meta: expectedMeta }));

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].detail).to.equal(expectedMessageError);
        expect(response.result.errors[0].code).to.equal(expectedCode);
        expect(response.result.errors[0].meta).to.equal(expectedMeta);
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

  describe('#finishPixContest', () => {

    const method = 'PATCH';
    const url = '/api/users/1/finish-pix-contest';

    let payload;

    beforeEach(() => {
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
      payload = {
        data: {
          id: 1,
          type: 'external-users',
          attributes: {
            'external-user-token': 'TOKEN',
            'expected-user-id': 1,
          },
        },
      };
    });

    context('Success cases', () => {

      it('should return a HTTP response with status code 200', async () => {
        // given
        usecases.finishPixContest.resolves(domainBuilder.buildUser());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      it('should return a 403 HTTP response when authenticated user is not authorized to update requested user', async () => {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });

    });
  });

});
