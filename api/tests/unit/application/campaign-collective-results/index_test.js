const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignCollectiveResults = require('../../../../lib/application/campaign-collective-results/campaign-collective-results-controller');

describe('Unit | Application | Campaign Collective Results| Route', function() {

  let server;

  beforeEach(() => {
    sinon.stub(campaignCollectiveResults, 'get').returns('ok');

    server = Hapi.server();

    return server.register(require('../../../../lib/application/campaign-collective-results'));
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
