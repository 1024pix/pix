const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const metricController = require('../../../../lib/application/metrics/metric-controller');
const route = require('../../../../lib/application/metrics');

describe('Unit | Router | Metrics', () => {
  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('GET /metrics', () => {

    beforeEach(() => {
      sinon.stub(metricController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/metrics' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
