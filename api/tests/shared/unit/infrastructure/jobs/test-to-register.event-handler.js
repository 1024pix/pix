import { EventHandler } from '../../../../../src/shared/application/jobs/event-handler.js';
import { TestEvent } from './test-event.js';

export class TestToRegisterEventHandler extends EventHandler {
  constructor() {
    super('test.to-register.event-queue', TestEvent.eventName);
  }

  async handle() {
    return true;
  }
}
