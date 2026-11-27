import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';
import { JobTeam } from '../../../../../src/shared/application/jobs/job-controller.js';
import { TestEvent } from './test-event.js';

export class TestToDeleteEventHandler extends EventHandler {
  constructor() {
    super('test.to-delete.event-queue', TestEvent.eventName, {
      description: 'Test disabled event handler.',
      team: JobTeam.STAFF,
    });
  }

  get isJobEnabled() {
    return false;
  }

  async handle() {
    return true;
  }
}
