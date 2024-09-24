import { EventLoggingJobController } from '../../../../../src/identity-access-management/application/jobs/event-logging.job-controller.js';
import { EventLoggingJob } from '../../../../../src/identity-access-management/domain/models/jobs/EventLoggingJob.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Jobs | EventLoggingJobController', function () {
  it('sets up the job controller configuration', async function () {
    const jobController = new EventLoggingJobController();
    expect(jobController.jobName).to.equal(EventLoggingJob.name);
  });

  it('logs the event', async function () {
    // given
    const auditLoggerRepository = { logEvent: sinon.stub() };
    const options = { dependencies: { auditLoggerRepository } };
    const data = {
      client: 'PIX_APP',
      action: 'EMAIL_CHANGED',
      role: 'USER',
      userId: 123,
      targetUserId: 456,
      data: { foo: 'bar' },
      occurredAt: new Date(),
    };

    // when
    const jobController = new EventLoggingJobController();
    await jobController.handle({ data, ...options });

    // then
    expect(auditLoggerRepository.logEvent).to.have.been.calledWith({
      client: data.client,
      action: data.action,
      role: data.role,
      userId: data.userId.toString(),
      targetUserId: data.targetUserId.toString(),
      data: data.data,
      occurredAt: data.occurredAt,
    });
  });
});
