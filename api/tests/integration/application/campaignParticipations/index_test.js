const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');

describe('Integration | Application | Route | campaignParticipationRouter', () => {

  let server;

  beforeEach(() => {
    sinon.stub(campaignParticipationController, 'shareCampaignResult').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignParticipationController, 'find').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(campaignParticipationController, 'getAnalysis').callsFake((request, h) => h.response('ok').code(200));

    server = Hapi.server();

    return server.register(require('../../../../lib/application/campaignParticipations'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    it('should exist', async () => {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/campaign-participations',
      });

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/campaign-participations/FAKE_ID',
        payload: {
          data: {
            type: 'campaign-participation',
            attributes: {
              isShared: true
            }
          }
        }
      });

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/campaign-participations/{id}/analyses', () => {

    context('when id is not an integer', () => {

      it('should return 400 - Bad request', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/campaign-participations/FAKE_ID/analyses',
        });

        // then
        expect(response.statusCode).to.equal(400);
      });

    });

    context('when id is an integer', () => {

      it('should return 200', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/campaign-participations/12/analyses',
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

    });
  });

});
