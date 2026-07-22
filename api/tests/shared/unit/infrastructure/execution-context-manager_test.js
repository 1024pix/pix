import { expect } from 'chai';
import sinon from 'sinon';

import {
  addCorrelationInfo,
  addCorrelationInfos,
  CORRELATION_METADATA,
  executeInContext,
  EXECUTORS,
  getContext,
  getCorrelationInfo,
  getInContext,
  getRequestId,
  setInContext,
} from '../../../../src/shared/infrastructure/execution-context-manager.js';

describe('Shared | Unit | Infrastructure | execution-context-manager', function () {
  describe('#getCorrelationContext', function () {
    context('when an execution context is ongoing', function () {
      context('request_id and user_id computing', function () {
        context('when executor is a JOB', function () {
          it('should not interpret request_id and user_id from a request object', async function () {
            const context = {
              request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              default_request_id: 'fallbackRequestId',
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.JOB);

            expect(correlationContext).to.deep.equal({
              user_id: null,
              request_id: null,
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });

          it('should add request_id and user_id when already in context', async function () {
            const context = {
              request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              request_id: 'myContextRequestId',
              user_id: 456,
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.JOB);

            expect(correlationContext).to.deep.equal({
              user_id: 456,
              request_id: 'myContextRequestId',
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });
        });
        context('when executor is a SCRIPT', function () {
          it('should not interpret request_id and user_id from a request object and ignore default_request_id value', async function () {
            const context = {
              request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              default_request_id: 'fallbackRequestId',
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.SCRIPT);

            expect(correlationContext).to.deep.equal({
              user_id: null,
              request_id: null,
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });

          it('should add request_id and user_id when already in context', async function () {
            const context = {
              request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              request_id: 'myContextRequestId',
              user_id: 456,
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.SCRIPT);

            expect(correlationContext).to.deep.equal({
              user_id: 456,
              request_id: 'myContextRequestId',
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });
        });
        context('when executor is a REQUEST', function () {
          it('should interpret request_id and user_id from a request object, overriding values already in context', async function () {
            const context = {
              request: { headers: { 'x-request-id': 'myRequestId' }, auth: { credentials: { userId: 123 } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              request_id: 'myContextRequestId',
              user_id: 456,
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.REQUEST);

            expect(correlationContext).to.deep.equal({
              user_id: 123,
              request_id: 'myRequestId',
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });

          it('should read fallback value for request_id when primary value is missing', async function () {
            const context = {
              some: 'noCorrelationInfo',
              default_request_id: 'fallbackRequestId',
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.REQUEST);

            sinon.assert.match(correlationContext, {
              user_id: null,
              request_id: 'fallbackRequestId',
              scriptId: null,
              jobId: null,
              [CORRELATION_METADATA]: null,
            });
          });

          it('should add request_id and user_id already in context when nothing found in request object nor default_request_id found', async function () {
            const context = {
              request: { headers: { foo: 'bar' }, auth: { credentials: { foo: 'bar' } } },
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              request_id: 'myRequestId',
              user_id: 'myUserId',
            };
            const correlationContext = await executeInContext(context, () => getCorrelationInfo(), EXECUTORS.REQUEST);

            expect(correlationContext).to.deep.equal({
              user_id: 'myUserId',
              request_id: 'myRequestId',
              scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
              jobId: 'myJobId',
              [CORRELATION_METADATA]: null,
            });
          });
        });
      });

      it('should return default or null values when context info are missing', async function () {
        const context = {
          some: 'noCorrelationInfo',
        };
        const correlationContext = await executeInContext(context, () => getCorrelationInfo());

        sinon.assert.match(correlationContext, {
          user_id: null,
          request_id: null,
          scriptId: null,
          jobId: null,
          [CORRELATION_METADATA]: null,
        });
      });

      it('should add any extra correlation info', async function () {
        const context = {
          scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
          jobId: 'myJobId',
          request_id: 'myContextRequestId',
          user_id: 456,
          [CORRELATION_METADATA]: {
            sessionId: 789,
          },
        };
        const correlationContext = await executeInContext(context, () => getCorrelationInfo());

        sinon.assert.match(correlationContext, {
          user_id: 456,
          request_id: 'myContextRequestId',
          scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02',
          jobId: 'myJobId',
          [CORRELATION_METADATA]: {
            sessionId: 789,
          },
        });
      });
    });
  });

  describe('#addCorrelationInfo', function () {
    it('should add value in given path destined to be available in correlation info', function () {
      // given
      const context = {};

      // when
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        addCorrelationInfo('sessionId', 456);
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: {
          sessionId: 456,
        },
      });
    });

    it('should overwrite value in given path destined to be available in correlation info', function () {
      // given
      const context = {};

      // when
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        addCorrelationInfo('sessionId', 456);
        addCorrelationInfo('sessionId', 789);
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: {
          sessionId: 789,
        },
      });
    });

    it('should ignore info added outside of the context', function () {
      // given
      const context = {};

      // when
      addCorrelationInfo('sessionId', 456);
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: null,
      });
    });
  });

  describe('#addCorrelationInfos', function () {
    it('should add values in given paths destined to be available in correlation info', function () {
      // given
      const context = {};

      // when
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        addCorrelationInfos({
          sessionId: 456,
          userId: 789,
        });
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: {
          sessionId: 456,
          userId: 789,
        },
      });
    });

    it('should overwrite value in given path destined to be available in correlation info', function () {
      // given
      const context = {};

      // when
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        addCorrelationInfos({
          sessionId: 456,
          userId: 789,
        });
        addCorrelationInfos({
          sessionId: 111,
          organizationId: 222,
        });
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: {
          sessionId: 111,
          userId: 789,
          organizationId: 222,
        },
      });
    });

    it('should ignore info added outside of the context', function () {
      // given
      const context = {};

      // when
      addCorrelationInfos({
        sessionId: 111,
        organizationId: 222,
      });
      const result = executeInContext(context, () => {
        setInContext('irrelevant', 'info');
        return getCorrelationInfo();
      });

      // then
      expect(result).to.deep.equal({
        request_id: null,
        user_id: null,
        jobId: null,
        scriptId: null,
        [CORRELATION_METADATA]: null,
      });
    });
  });

  describe('#getRequestId', function () {
    it('should return request ID within context', async function () {
      // given
      const context = { request: { headers: { 'x-request-id': 'abc123' } } };

      // when
      const requestId = await executeInContext(context, () => getRequestId());

      // then
      expect(requestId).equal('abc123');
    });
  });

  describe('#getContext', function () {
    it('should return async local storage', function () {
      // given
      const expectedResult = { foo: 'bar' };

      // when
      const result = executeInContext(expectedResult, () => getContext());

      // then
      expect(result).to.deep.equal({
        ...expectedResult,
        executor: null,
      });
    });
  });

  describe('#getInContext', function () {
    it('should return value from given path', function () {
      // given
      const expectedResult = 'baz';
      const context = { foo: { bar: expectedResult } };

      // when
      const result = executeInContext(context, () => getInContext('foo.bar'));

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    it('should return defaultValue when given path is undefined', function () {
      // given
      const defaultValue = 'foo';
      const context = {};

      // when
      const result = executeInContext(context, () => getInContext('foo.bar', defaultValue));

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
      const result = executeInContext(context, () => {
        setInContext(givenPath, givenValue);
        return getContext();
      });

      // then
      expect(result.foo.bar).to.equal(givenValue);
    });
  });

  describe('#executeInContext', function () {
    context('when a context already exists', function () {
      it('should merge context information except for executor and run the function', async function () {
        const context = { foo: 'bar', bubu: 'wowo' };

        const res = await executeInContext(
          context,
          () => {
            const newContext = { foo: 'bar1', fuu: 'baz' };
            return executeInContext(
              newContext,
              () => {
                return getContext();
              },
              EXECUTORS.SCRIPT,
            );
          },
          EXECUTORS.JOB,
        );

        expect(res).to.deep.equal({
          foo: 'bar1',
          fuu: 'baz',
          bubu: 'wowo',
          executor: EXECUTORS.JOB,
        });
      });
    });

    context('when a context does not exist', function () {
      it('should run the function in a dedicated context', async function () {
        const context = { foo: 'bar' };

        const res = await executeInContext(context, () => getContext(), EXECUTORS.JOB);

        expect(res).to.deep.equal({
          foo: 'bar',
          executor: EXECUTORS.JOB,
        });
      });
    });
  });
});
