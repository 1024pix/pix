import {
  executeInContext,
  executionContextManager,
  getContext,
  getCorrelationContext,
  getInContext,
  getRequestId,
  setInContext,
} from '../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Shared | Unit | Infrastructure | execution-context-manager', function () {
  describe('#getCorrelationContext', function () {
    context('when an execution context is ongoing', function () {
      it('should return an object filled with correlation context info', async function () {
        const context = {
          request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
          scriptName: 'myScriptName',
          jobId: 'myJobId',
        };
        const correlationContext = await executionContextManager.run(context, () => getCorrelationContext());

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
        const correlationContext = await executionContextManager.run(context, () => getCorrelationContext());

        sinon.assert.match(correlationContext, {
          user_id: null,
          request_id: 'fallbackRequestId',
          scriptName: null,
          jobId: null,
        });
      });

      it('should return default or null values when context info are missing', async function () {
        const context = {
          some: 'noCorrelationInfo',
        };
        const correlationContext = await executionContextManager.run(context, () => getCorrelationContext());

        sinon.assert.match(correlationContext, {
          user_id: null,
          request_id: null,
          scriptName: null,
          jobId: null,
        });
      });
    });
  });

  describe('#getRequestId', function () {
    it('should return request ID', function () {
      // given
      const expectedRequestId = Symbol('RequestId');
      const context = { request: { headers: { 'x-request-id': expectedRequestId } } };
      sinon.stub(executionContextManager, 'getStore');
      executionContextManager.getStore.returns(context);

      // when
      const requestId = getRequestId();

      // then
      expect(requestId).equal(expectedRequestId);
    });
  });

  describe('#getContext', function () {
    it('should return async local storage', function () {
      // given
      const expectedResult = { foo: 'bar' };

      // when
      const result = executionContextManager.run(expectedResult, () => getContext());

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#getInContext', function () {
    it('should return value from given path', function () {
      // given
      const expectedResult = 'baz';
      const context = { foo: { bar: expectedResult } };

      // when
      const result = executionContextManager.run(context, () => getInContext('foo.bar'));

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    it('should return defaultValue when given path is undefined', function () {
      // given
      const defaultValue = 'foo';
      const context = {};

      // when
      const result = executionContextManager.run(context, () => getInContext('foo.bar', defaultValue));

      // then
      expect(result).to.deep.equal(defaultValue);
    });
  });

  describe('#setInContext', function () {
    it('should set value in given path', function () {
      // given
      const givenValue = 'baz';
      const givenPath = 'foo.bar';
      const context = {};

      // when
      const result = executionContextManager.run(context, () => {
        setInContext(givenPath, givenValue);
        return executionContextManager.getStore();
      });

      // then
      expect(result.foo.bar).to.equal(givenValue);
    });
  });

  describe('#executeInContext', function () {
    context('when a context already exists', function () {
      it('should merge context information and run the function', async function () {
        const context = { foo: 'bar', bubu: 'wowo' };

        const res = await executeInContext(context, () => {
          const newContext = { foo: 'bar1', fuu: 'baz' };
          return executeInContext(newContext, () => {
            return getContext();
          });
        });

        expect(res).to.deep.equal({
          foo: 'bar1',
          fuu: 'baz',
          bubu: 'wowo',
        });
      });
    });

    context('when a context does not exist', function () {
      it('should run the function in a dedicated context', async function () {
        const context = { foo: 'bar' };

        const res = await executeInContext(context, () => {
          const currentContext = getContext();
          return currentContext.foo;
        });

        expect(res).to.equal('bar');
      });
    });
  });
});
