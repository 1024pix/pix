const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');

describe('Integration | Application | Route | campaignParticipationRouter', () => {

  let server;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(campaignParticipationController, 'shareCampaignResult').callsFake((request, reply) => reply('ok').code(201));
    sandbox.stub(campaignParticipationController, 'getCampaignParticipationByAssessment').callsFake((request, reply) => reply('ok').code(201));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/campaignParticipations') });
  });

  afterEach(() => {
    sandbox.restore();
    server.stop();
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    it('should exist', () => {
      // given

      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaign-participations',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
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
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });

    });
  });

});
