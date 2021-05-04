const {
  expect,
  sinon,
  HttpTestServer,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/campaign-participations');

const campaignParticipationController = require('../../../../lib/application/campaign-participations/campaign-participation-controller');

describe('Integration | Application | Route | campaignParticipationRouter', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(campaignParticipationController, 'shareCampaignResult').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignParticipationController, 'find').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignParticipationController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignParticipationController, 'getCampaignAssessmentParticipation').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(campaignParticipationController, 'getCampaignAssessmentParticipationResult').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/campaign-participations');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    it('should exist', async () => {
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

  describe('GET /api/campaign-participations/{id}/analyses', () => {

    const method = 'GET';

    context('when id is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaign-participations/FAKE_ID/analyses');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when id is an integer', () => {

      it('should return 200', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaign-participations/12/analyses');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}', () => {

    const method = 'GET';

    context('when campaignId is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/FAKE_ID/assessment-participations/1');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignParticipationId is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/FAKE_ID');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignId and campaignParticipationId are integers', () => {

      it('should return 200', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/1');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}/results', () => {

    const method = 'GET';

    context('when campaignId is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/FAKE_ID/assessment-participations/1/results');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignParticipationId is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/FAKE_ID/results');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignId and campaignParticipationId are integers', () => {

      it('should return 200', async () => {
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/1/results');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
