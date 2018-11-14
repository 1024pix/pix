const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

describe('Integration | Application | Route | campaignRouter', () => {
  let server;

  beforeEach(() => {
    sinon.stub(campaignController, 'save').callsFake((request, reply) => reply('ok').code(201));
    sinon.stub(campaignController, 'getCsvResults').callsFake((request, reply) => reply('ok').code(201));
    sinon.stub(campaignController, 'update').callsFake((request, reply) => reply('ok').code(201));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/campaigns') });
  });

  afterEach(() => {
    campaignController.save.restore();
    campaignController.getCsvResults.restore();
    campaignController.update.restore();

    server.stop();
  });

  describe('POST /api/campaigns', () => {

    it('should exist', function() {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/campaigns',
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

    it('should exist', function() {
      // when
      const promise = server.inject({
        method: 'PATCH',
        url: '/api/campaigns/FAKE_ID',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });
    });

  });

});
