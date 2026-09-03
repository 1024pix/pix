import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';
import { TestEvent } from './test-event.js';

export class TestToDeleteEventHandler extends EventHandler {
  constructor() {
    super('test.to-delete.event-queue', TestEvent.eventName);
  }

  get isJobEnabled() {
    return false;
  }

  async handle() {
    return true;
  }
}
