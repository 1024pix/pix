const PROJECT_ROOT = '../../../..';

const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const metricController = require(`${PROJECT_ROOT}/lib/application/metrics/metric-controller`);

describe('Unit | Router | Metrics', () => {
  let server;

  beforeEach(() => {
    server = this.server = Hapi.server();
    return server.register(require(`${PROJECT_ROOT}/lib/application/metrics`));
  });

  describe('GET /metrics', () => {

    before(() => {
      sinon.stub(metricController, 'get').returns('ok');
    });

    after(() => {
      metricController.get.restore();
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/metrics' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
