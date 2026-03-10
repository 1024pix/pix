import { asyncLocalStorage } from '../../../../src/shared/infrastructure/async-local-storage.js';
import { getCorrelationContext, getRequestId } from '../../../../src/shared/infrastructure/monitoring-tools.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Shared | Unit | Infrastructure | monitoring-tools', function () {
  describe('#getRequestId', function () {
    it('should return request ID', function () {
      // given
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

      it('should read fallback value for request_id when primary value is missing', async function () {
        const context = {
          some: 'noCorrelationInfo',
          default_request_id: 'fallbackRequestId',
        };
        const correlationContext = await asyncLocalStorage.run(context, () => getCorrelationContext());

        sinon.assert.match(correlationContext, {
          user_id: '-',
          request_id: 'fallbackRequestId',
          scriptName: null,
          jobId: null,
        });
      });

      it('should return default or null values when context info are missing', async function () {
        const context = {
          some: 'noCorrelationInfo',
        };
        const correlationContext = await asyncLocalStorage.run(context, () => getCorrelationContext());

        sinon.assert.match(correlationContext, {
          user_id: '-',
          request_id: null,
          scriptName: null,
          jobId: null,
        });
      });
    });
  });
});
