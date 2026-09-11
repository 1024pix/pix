import { expect } from 'chai';

import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';
import { JobController } from '../../../../../src/shared/application/jobs/job-controller.js';

describe('Unit | Shared | Application | Jobs | EventHandler', function () {
  it('should be a JobController', function () {
    // when
    const handler = new EventHandler('jobName', 'eventName');

    // then
    expect(handler).to.be.instanceOf(JobController);
  });

  it('should set the eventName it subscribes to', function () {
    // when
    const handler = new EventHandler('jobName', 'eventName');

    // then
    expect(handler.eventName).to.equal('eventName');
  });

  it('should enable the dead letter queue by default', function () {
    // when
    const handler = new EventHandler('jobName', 'eventName');

    // then
    expect(handler.isDeadLetterQueueEnabled).to.be.true;
  });

  it('should allow disabling the dead letter queue explicitly', function () {
    // when
    const handler = new EventHandler('jobName', 'eventName', { isDeadLetterQueueEnabled: false });

    // then
    expect(handler.isDeadLetterQueueEnabled).to.be.false;
  });
});
