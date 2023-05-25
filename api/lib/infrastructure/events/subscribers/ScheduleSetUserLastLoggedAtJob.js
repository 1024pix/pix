import { UserAuthenticated } from '../../../domain/events/UserAuthenticated.js';

class ScheduleSetUserLastLoggedAtJob {
  constructor({ setUserLastLoggedAtJob }) {
    this.setUserLastLoggedAtJob = setUserLastLoggedAtJob;
  }

  async handle(event) {
    await this.setUserLastLoggedAtJob.schedule(event);
  }

  get name() {
    return 'SetUserLastLoggedAt';
  }
}

ScheduleSetUserLastLoggedAtJob.event = UserAuthenticated;

export { ScheduleSetUserLastLoggedAtJob };
