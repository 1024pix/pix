import { Event } from './Event.js';

class UserAuthenticated extends Event {
  constructor({ userId } = {}) {
    super();
    this.userId = userId;
  }
}

export { UserAuthenticated };
