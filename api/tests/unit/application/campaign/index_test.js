const { expect, sinon, hFake, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const route = require('../../../../lib/application/campaigns');

describe('Unit | Application | Router | campaign-router ', function() {

  let server;
  const userId = 1;

  beforeEach(() => {
    sinon.stub(campaignController, 'getCollectiveResult').returns('ok');
    sinon.stub(campaignController, 'archiveCampaign').returns('ok');
    sinon.stub(campaignController, 'unarchiveCampaign').returns('ok');

    server = Hapi.server();

    return server.register(route);
  });

  describe('GET /api/campaigns/{id}/collective-results', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/campaigns/1/collective-results',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });

  describe('PUT /api/campaigns/{id}/archive', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'PUT',
        url: '/api/campaigns/{id}/archive',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        }
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });

  describe('DELETE /api/campaigns/{id}/archive', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/campaigns/{id}/archive',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        }
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });
});
