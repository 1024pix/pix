const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Integration | Application | Route | campaignRouter', () => {

  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'save').callsFake((request, reply) => reply('ok').code(201));
    sinon.stub(campaignController, 'getCsvResults').callsFake((request, reply) => reply('ok').code(201));
    sinon.stub(campaignController, 'shareCampaignResult').callsFake((request, reply) => reply('ok').code(201));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/campaigns') });
  });

  afterEach(() => {
    campaignController.save.restore();
    campaignController.getCsvResults.restore();
    campaignController.shareCampaignResult.restore();
    server.stop();
  });

  describe('POST /api/campaigns', () => {

    it('should exist', function() {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/campaigns',
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'ma campagne'
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

  describe('GET /api/campaigns/{id}/csvResults', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/campaigns/FAKE_ID/csvResults',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });

    });
  });

  describe('PATCH /api/campaigns/{id}', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'PATCH',
        url: '/api/campaigns/FAKE_ID',
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              assessmentId: 'FAKE_NUMBER'
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
