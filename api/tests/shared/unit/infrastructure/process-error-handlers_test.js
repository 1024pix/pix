import { EventEmitter } from 'node:events';

import { expect } from 'chai';
import sinon from 'sinon';

import { registerProcessErrorHandlers } from '../../../../src/shared/infrastructure/process-error-handlers.js';

describe('Shared | Unit | Infrastructure | process-error-handlers', function () {
  let fakeProcess, logger;

  beforeEach(function () {
    fakeProcess = new EventEmitter();
    fakeProcess.exit = sinon.stub();
    logger = { error: sinon.stub() };
  });

  context('when handlers are registered', function () {
    beforeEach(function () {
      registerProcessErrorHandlers({ processRef: fakeProcess, logger });
    });

    it('logs an unhandled rejection as error without exiting', function () {
      // given
      const reason = new Error('rejected');

      // when
      fakeProcess.emit('unhandledRejection', reason, Promise.resolve());

      // then
      expect(logger.error).to.have.been.calledOnceWithExactly({
        error: reason,
        unhandled: true,
        origin: 'Unhandled promise rejection',
      });
      expect(fakeProcess.exit).not.to.have.been.called;
    });

    it('logs an uncaught exception as error without exiting', function () {
      // given
      const error = new Error('uncaught');

      // when
      fakeProcess.emit('uncaughtException', error, 'uncaughtException');

      // then
      expect(logger.error).to.have.been.calledOnceWithExactly({ error, unhandled: true, origin: 'Uncaught exception' });
      expect(fakeProcess.exit).not.to.have.been.called;
    });
  });
});
