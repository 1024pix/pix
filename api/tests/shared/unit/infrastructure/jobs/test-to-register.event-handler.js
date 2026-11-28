import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../../../src/shared/application/jobs/job-controller.js';
import { TestEvent } from './test-event.js';

export class TestToRegisterEventHandler extends EventHandler {
  constructor() {
    super('test.to-register.event-queue', TestEvent.eventName, {
      description: 'Test event handler.',
      team: JobTeam.STAFF,
    });
  }

  async handle() {
    return true;
  }
}
