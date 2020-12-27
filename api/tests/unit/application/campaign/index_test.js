const {
  expect,
  HttpTestServer,
  sinon,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');

const { NotFoundError } = require('../../../../lib/domain/errors');
const moduleUnderTest = require('../../../../lib/application/campaigns');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Unit | Application | Router | campaign-router ', function() {

  const userId = 1;

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(campaignController, 'getCollectiveResult').returns('ok');
    sinon.stub(campaignController, 'archiveCampaign').returns('ok');
    sinon.stub(campaignController, 'unarchiveCampaign').returns('ok');
    sinon.stub(campaignController, 'getByCode');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/campaigns?filter[code=SOMECODE]', () => {

    it('should exist', async () => {
      // given
      campaignController.getByCode.returns('ok');

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns?filter[code=SOMECODE]');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should throw a 404 NotFound error when controller throws a NotFound domain error', async () => {
      // given
      campaignController.getByCode.rejects(new NotFoundError());

      // when
      const response = await httpTestServer.request('GET', '/api/campaigns?filter[code=SOMECODE]');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/campaigns/{id}/collective-results', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/campaigns/1/collective-results');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/campaigns/{id}/archive', () => {

    it('should exist', async () => {
      // given
      const method = 'PUT';
      const url = '/api/campaigns/{id}/archive';
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/campaigns/{id}/archive', () => {

    it('should exist', async () => {
      // given
      const method = 'DELETE';
      const url = '/api/campaigns/{id}/archive';
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
