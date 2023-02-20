import { expect, sinon, domainBuilder, HttpTestServer } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import usecases from '../../../../lib/domain/usecases';
import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../../../../lib/domain/errors';
import AssessmentResult from '../../../../lib/domain/read-models/participant-results/AssessmentResult';
import moduleUnderTest from '../../../../lib/application/users';

describe('Integration | Application | Users | user-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sandbox.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');

    sandbox.stub(usecases, 'getUserCampaignParticipationToCampaign');
    sandbox.stub(usecases, 'getUserProfileSharedForCampaign');
    sandbox.stub(usecases, 'getUserCampaignAssessmentResult');
    sandbox.stub(usecases, 'removeAuthenticationMethod');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#getUserCampaignParticipationToCampaign', function () {
    const auth = { credentials: {}, strategy: {} };

    context('Success cases', function () {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const campaignParticipation = domainBuilder.buildCampaignParticipation();

      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
        auth.credentials.userId = '1234';
      });

      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.getUserCampaignParticipationToCampaign.resolves(campaignParticipation);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/users/1234/campaigns/5678/campaign-participations',
          null,
          auth
        );

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', function () {
      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should return a 403 HTTP response', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/campaign-participations');

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
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

  describe('#getUserCampaignAssessmentResult', function () {
    const auth = { credentials: {}, strategy: {} };

    context('Success cases', function () {
      const campaignAssessmentResult = new AssessmentResult({
        participationResults: { knowledgeElements: [] },
        competences: [],
        badgeResultsDTO: [],
        stages: [],
        isCampaignMultipleSendings: false,
      });

      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
        auth.credentials.userId = '1234';
      });

      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.getUserCampaignAssessmentResult
          .withArgs({ userId: '1234', campaignId: 5678, locale: 'fr-fr' })
          .resolves(campaignAssessmentResult);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/users/1234/campaigns/5678/assessment-result',
          null,
          auth
        );

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', function () {
      it('should return a 403 HTTP response', async function () {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/assessment-result');

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return a 401 HTTP response', async function () {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(401).takeover());
        });

        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/campaigns/5678/assessment-result');

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('#removeAuthenticationMethod', function () {
    const method = 'POST';
    const url = '/api/admin/users/1/remove-authentication';
    const payload = {
      data: {
        attributes: {
          type: 'EMAIL',
        },
      },
    };

    beforeEach(function () {
      securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);
    });

    context('Success cases', function () {
      it('should return a HTTP response with status code 204', async function () {
        // given
        usecases.removeAuthenticationMethod.resolves();

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      it('should return a 403 HTTP response when when user is not allowed to access resource', async function () {
        // given
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should return a 403 HTTP response when the usecase throw a UserNotAuthorizedToRemoveAuthenticationMethod', async function () {
        // given
        usecases.removeAuthenticationMethod.throws(new UserNotAuthorizedToRemoveAuthenticationMethod());
        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
