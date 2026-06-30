import sinon from 'sinon';

import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import { campaignParticipationRoute as moduleUnderTest } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Application | Route | campaignParticipationRouter', function () {
  let httpTestServer, sandbox;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sandbox.stub(securityPreHandlers, 'checkOrganizationAccess').returns(true);

    sinon
      .stub(campaignParticipationController, 'getCampaignAssessmentParticipationResult')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(campaignParticipationController, 'getUserCampaignAssessmentResult')
      .callsFake((request, h) => h.response('ok').code(200));

    sinon
      .stub(campaignParticipationController, 'getAnonymisedCampaignAssessments')
      .callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function () {
    context('When Authenticated user mismatch requested user', function () {
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

  describe('GET /api/users/{userId}/campaigns/{campaignId}/assessment-result', function () {
    context('Error cases', function () {
      it('should not called controller when user not authenticated', async function () {
        // given
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        httpTestServer.request('GET', '/api/users/1234/campaigns/5678/assessment-result');

        // then
        expect(campaignParticipationController.getUserCampaignAssessmentResult.notCalled).to.be.true;
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

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}/results', function () {
    const method = 'GET';

    context('when campaignId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(
          method,
          '/api/campaigns/FAKE_ID/assessment-participations/1/results',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignParticipationId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(
          method,
          '/api/campaigns/1/assessment-participations/FAKE_ID/results',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignId and campaignParticipationId are integers', function () {
      it('should return 200', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/1/results');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/organization-learners/{organizationLearnerId}/participations', function () {
    const method = 'GET';

    context('when campaignId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(
          method,
          '/api/campaigns/BAD_ID/organization-learners/1/participations',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when organizationLearnerId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(
          method,
          '/api/campaigns/1/organization-learners/BAD_ID/participations',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /users/{userId}/anonymised-campaign-assessments', function () {
    context('When authenticated user mismatch requested user or user is not authenticated ', function () {
      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should return a 403 HTTP response', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/1234/anonymised-campaign-assessments');

        // then
        expect(response.statusCode).to.equal(403);
        expect(campaignParticipationController.getAnonymisedCampaignAssessments).not.called;
      });
    });

    context('When userId is not an integer', function () {
      it('should return 400 - Bad request when userId is not an integer', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/NOTANID/anonymised-campaign-assessments');

        // then
        expect(response.statusCode).to.equal(400);
        expect(campaignParticipationController.getAnonymisedCampaignAssessments).not.called;
      });
    });
  });
});
