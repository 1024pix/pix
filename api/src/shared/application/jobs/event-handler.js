import { JobController } from './job-controller.js';

export class EventHandler extends JobController {
  constructor(jobName, eventName, { ...options } = {}) {
    super(jobName, { isDeadLetterQueueEnabled: true, ...options });
    this.eventName = eventName;
  }
}
