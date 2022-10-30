const { expect, sinon } = require('../../test-helper');
const logger = require('../../../lib/infrastructure/logger');
const monitoringTools = require('../../../lib/infrastructure/monitoring-tools');

describe('Unit | Infrastructure | monitoring-tools', function () {
  describe('#logError', function () {
    it('should call logger.error with parameter and context', async function () {
      // given
      const errorLoggerStub = sinon.stub(logger, 'error');
      logger.error.resolves();

      const getCorrelationContext = () => {
        return {
          user_id: '1',
          request_id: 'REQUEST-ID',
        };
      };

      // when
      await monitoringTools.logError({ foo: 'bar' }, getCorrelationContext);

      // then
      expect(errorLoggerStub).to.have.been.calledWith({
        user_id: '1',
        request_id: 'REQUEST-ID',
        foo: 'bar',
      });
    });
  });
});
