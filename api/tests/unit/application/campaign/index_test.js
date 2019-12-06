const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Unit | Application | Router | campaign-router ', function() {

  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'getCollectiveResult').returns('ok');

    server = Hapi.server();

    return server.register(require('../../../../lib/application/campaigns'));
  });

  describe('GET /api/campaigns/{id}/collective-results', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/campaigns/1/collective-results'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });
});
