import { UserAnonymizedEventLoggingJobScheduler } from '../../../../../../lib/infrastructure/events/subscribers/audit-log/UserAnonymizedEventLoggingJobScheduler.js';
import { config } from '../../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Infrastructure | Events | Subscribers | UserAnonymizedEventLoggingJobScheduler', function () {
  describe('#handle', function () {
    describe('when audit logger in not enabled in config', function () {
      it('schedules the event', function () {
        // given
        config.auditLogger.isEnabled = false;
        const event = Symbol('event');
        const userAnonymizedEventLoggingJob = {
          schedule: sinon.stub(),
        };
        const scheduler = new UserAnonymizedEventLoggingJobScheduler({ userAnonymizedEventLoggingJob });

        // when
        scheduler.handle(event);

        // then
        expect(userAnonymizedEventLoggingJob.schedule).to.not.have.been.calledWithExactly(event);
      });
    });

    describe('when audit logger in enabled in config', function () {
      it('schedules the event', function () {
        // given
        config.auditLogger.isEnabled = true;
        const event = Symbol('event');
        const userAnonymizedEventLoggingJob = {
          schedule: sinon.stub(),
        };
        const scheduler = new UserAnonymizedEventLoggingJobScheduler({ userAnonymizedEventLoggingJob });

        // when
        scheduler.handle(event);

        // then
        expect(userAnonymizedEventLoggingJob.schedule).to.have.been.calledWithExactly(event);
      });
    });
  });
});
