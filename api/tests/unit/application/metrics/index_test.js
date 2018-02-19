const PROJECT_ROOT = '../../../..';

const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const metricController = require(`${PROJECT_ROOT}/lib/application/metrics/metric-controller`);

describe('Unit | Router | Metrics', () => {

  let server;

  beforeEach(() => {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require(`${PROJECT_ROOT}/lib/application/metrics`) });
  });

  function expectRouteToExist(routeOptions) {
    return server.inject(routeOptions)
      .then((res) => {
        expect(res.statusCode).to.equal(200);
      });
  }

  describe('GET /metrics', () => {

    before(() => {
      sinon.stub(metricController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      metricController.get.restore();
    });

    it('should exist', () => {
      return expectRouteToExist({ method: 'GET', url: '/metrics' });
    });
  });
});
