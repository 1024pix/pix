import { expect, sinon, HttpTestServer } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/campaign-participations';
import campaignParticipationController from '../../../../lib/application/campaign-participations/campaign-participation-controller';

describe('Integration | Application | Route | campaignParticipationRouter', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(campaignParticipationController, 'shareCampaignResult')
      .callsFake((request, h) => h.response('ok').code(201));
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

  describe('PATCH /api/campaign-participations/{id}', function () {
    it('should exist', async function () {
      // given
      const payload = {
        data: {
          type: 'campaign-participation',
          attributes: {
            isShared: true,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/campaign-participations/1', payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
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
          '/api/campaigns/FAKE_ID/assessment-participations/1/results'
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
          '/api/campaigns/1/assessment-participations/FAKE_ID/results'
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
});
