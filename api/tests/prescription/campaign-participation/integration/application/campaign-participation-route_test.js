import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/campaign-participation-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Route | campaignParticipationRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(campaignParticipationController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(campaignParticipationController, 'getCampaignAssessmentParticipation')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(campaignParticipationController, 'getCampaignAssessmentParticipationResult')
      .callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/campaign-participations/{id}/analyses', function () {
    const method = 'GET';

    context('when id is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaign-participations/FAKE_ID/analyses');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when id is an integer', function () {
      it('should return 200', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaign-participations/12/analyses');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}', function () {
    const method = 'GET';

    context('when campaignId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/FAKE_ID/assessment-participations/1');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignParticipationId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/FAKE_ID');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignId and campaignParticipationId are integers', function () {
      it('should return 200', async function () {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/1');

        // then
        expect(response.statusCode).to.equal(200);
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
});
