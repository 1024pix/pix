const { expect, hFake } = require('../../../test-helper');

const metricController = require('../../../../lib/application/metrics/metric-controller');

describe('Unit | Controller | metricController', () => {

  describe('#get', () => {

    it('should have type text/plain', async () => {
      // when
      const response = await metricController.get(null, hFake);

      // then
      expect(response.contentType).to.equal('text/plain');
    });

    it('should return default prometheus metrics', async () => {
      // when
      const response = await metricController.get(null, hFake);

      // then
      expect(response.source).to.contains('process_cpu_seconds_total');
    });

    it('should return metric api_request_total', async () => {
      // when
      const response = await metricController.get(null, hFake);

      // then
      expect(response.source).to.contains('api_request_total');
    });

    it('should return metric api_request_success', async () => {
      // when
      const response = await metricController.get(null, hFake);

      // then
      expect(response.source).to.contains('api_request_success');
    });
  });
});
