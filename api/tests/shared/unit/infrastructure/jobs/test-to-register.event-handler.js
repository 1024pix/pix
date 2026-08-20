import { AnonymizeUserEvent } from '../../../../../src/privacy/domain/events/AnonymizeUserEvent.js';
import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';

export class TestToRegisterEventHandler extends EventHandler {
  constructor() {
    super('test.to-register.event-queue', AnonymizeUserEvent.eventName);
  }

  async handle() {
    return true;
  }
}
