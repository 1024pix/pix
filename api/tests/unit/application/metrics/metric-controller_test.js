const { describe, it, expect } = require('../../../test-helper');

const metricController = require('../../../../lib/application/metrics/metric-controller');

describe('Unit | Controller | metricController', () => {

  describe('#get', () => {

    let result = null;
    const replyStub = (text) => { result = text; return { code() { }, type() { } }; };

    it('should have type text/plain', () => {
      // given
      let type = null;
      const typeStub = () => { return { type(t) { type = t; }, code() {} }; };

      // when
      metricController.get(null, typeStub);

      // then
      expect(type).to.equal('text/plain');
    });

    it('should return default prometheus metrics', () => {
      // when
      metricController.get(null, replyStub);

      // then
      expect(result).to.contains('process_cpu_seconds_total');
    });

    it('should return metric api_request_total', () => {
      // when
      metricController.get(null, replyStub);

      // then
      expect(result).to.contains('api_request_total');
    });

    it('should return metric api_request_success', () => {
      // when
      metricController.get(null, replyStub);

      // then
      expect(result).to.contains('api_request_success');
    });
  });
});
