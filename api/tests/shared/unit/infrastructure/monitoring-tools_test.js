import { config } from '../../../../src/shared/config.js';
import { asyncLocalStorage } from '../../../../src/shared/infrastructure/async-local-storage.js';
import { getCorrelationContext, getRequestId } from '../../../../src/shared/infrastructure/monitoring-tools.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Shared | Unit | Infrastructure | monitoring-tools', function () {
  describe('#getRequestId', function () {
    it('should return null when request monitoring is disabled', function () {
      // given
      sinon.stub(config.hapi, 'enableRequestMonitoring').value(false);

      // then
      expect(getRequestId()).equal(null);
    });

    it('should return request ID when request monitoring is enabled', function () {
      // given
      sinon.stub(config.hapi, 'enableRequestMonitoring').value(true);

      const expectedRequestId = Symbol('RequestId');
      const context = { request: { headers: { 'x-request-id': expectedRequestId } } };
      sinon.stub(asyncLocalStorage, 'getStore');
      asyncLocalStorage.getStore.returns(context);

      // when
      const requestId = getRequestId();

      // then
      expect(requestId).equal(expectedRequestId);
    });
  });

  describe('#getCorrelationContext', function () {
    context('when an execution context is ongoing', function () {
      it('should return an object filled with correlation context info', async function () {
        const context = {
          request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
          scriptName: 'myScriptName',
          jobId: 'myJobId',
        };
        const correlationContext = await asyncLocalStorage.run(context, () => getCorrelationContext());

        expect(correlationContext).to.deep.equal({
          user_id: 123,
          request_id: 'myRequestId',
          scriptName: 'myScriptName',
          jobId: 'myJobId',
        });
      });

      it('should return default or null values when context info are missing', async function () {
        const context = {
          some: 'noCorrelationInfo',
        };
        const correlationContext = await asyncLocalStorage.run(context, () => getCorrelationContext());

        sinon.assert.match(correlationContext, {
          user_id: '-',
          request_id: sinon.match(
            /^default_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          ),
          scriptName: null,
          jobId: null,
        });
      });
    });
  });
});
