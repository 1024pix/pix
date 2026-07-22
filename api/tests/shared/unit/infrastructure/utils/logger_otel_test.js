import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import sinon from 'sinon';

import { executeInContext, EXECUTORS } from '../../../../../src/shared/infrastructure/execution-context-manager.js';
import { child, logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Utils | logger | OpenTelemetry', function () {
  let emitStub;

  beforeEach(function () {
    emitStub = sinon.stub();
    sinon.stub(logs, 'getLogger').returns({ emit: emitStub, enabled: () => true });
  });

  it('emits an OpenTelemetry log record for each log level', function () {
    const levelToSeverity = {
      trace: SeverityNumber.TRACE,
      debug: SeverityNumber.DEBUG,
      info: SeverityNumber.INFO,
      warn: SeverityNumber.WARN,
      error: SeverityNumber.ERROR,
      fatal: SeverityNumber.FATAL,
    };

    for (const [level, severityNumber] of Object.entries(levelToSeverity)) {
      logger[level]({ foo: 'bar' }, `${level} message`);

      expect(logs.getLogger).to.have.been.calledWith('pix-api-logger');
      expect(emitStub).to.have.been.calledWithMatch({
        severityNumber,
        severityText: level,
        body: `${level} message`,
        attributes: sinon.match({ foo: 'bar' }),
      });
    }
  });

  it('does not emit a log record for the silent level', function () {
    logger.silent({ foo: 'bar' }, 'should not be emitted');

    expect(emitStub).to.not.have.been.called;
  });

  it('uses the single string argument as the body when no merging object is provided', function () {
    logger.info('a lone message');

    expect(emitStub).to.have.been.calledWithMatch({
      body: 'a lone message',
    });
    const [logRecord] = emitStub.firstCall.args;
    expect(logRecord.attributes).to.not.have.property('0');
  });

  it('includes the correlation info (request_id, user_id, scriptId, jobId) as attributes', function () {
    executeInContext(
      { request_id: 'request-1', user_id: 'user-1', scriptId: 'script-1', jobId: 'job-1' },
      () => logger.info({}, 'correlated message'),
      EXECUTORS.SCRIPT,
    );

    expect(emitStub).to.have.been.calledWithMatch({
      attributes: sinon.match({
        request_id: 'request-1',
        user_id: 'user-1',
        scriptId: 'script-1',
        jobId: 'job-1',
      }),
    });
  });

  it('merges the child() bindings into the emitted attributes', function () {
    const sectionLogger = child('my-section', { section: 'my-section' });

    sectionLogger.warn({ detail: 'oops' }, 'section warning');

    expect(emitStub).to.have.been.calledWithMatch({
      severityNumber: SeverityNumber.WARN,
      severityText: 'warn',
      body: 'section warning',
      attributes: sinon.match({ section: 'my-section', detail: 'oops' }),
    });
  });

  it('serializes without an error given Error objects', function () {
    logger.error({ error: new Error('Oups') }, 'Huston, we got a problem');

    expect(emitStub).to.have.been.calledWithMatch({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'error',
      body: 'Huston, we got a problem',
      attributes: sinon.match({ 'error.type': 'Error', 'error.message': 'Oups', 'error.stack': sinon.match.string }),
    });
  });
});
