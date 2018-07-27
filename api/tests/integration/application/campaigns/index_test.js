const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Integration | Application | Route | campaignRouter', () => {

  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'save').callsFake((request, reply) => reply('ok').code(201));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/campaigns') });
  });

  afterEach(() => {
    campaignController.save.restore();
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

});
