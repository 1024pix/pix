const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');

describe('Integration | Application | Route | campaignParticipationRouter', () => {

  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'shareCampaignResult').callsFake((request, reply) => reply('ok').code(201));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/campaignParticipations') });
  });

  afterEach(() => {
    campaignController.shareCampaignResult.restore();
    server.stop();
  });

  describe('PATCH /api/campaigns/{id}', () => {

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
