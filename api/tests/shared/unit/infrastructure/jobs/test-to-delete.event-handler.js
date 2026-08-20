import { AnonymizeUserEvent } from '../../../../../src/privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';

export class TestToDeleteEventHandler extends EventHandler {
  constructor() {
    super('test.to-delete.event-queue', AnonymizeUserEvent.eventName);
  }

  get isJobEnabled() {
    return false;
  }

  async handle() {
    return true;
  }
}
