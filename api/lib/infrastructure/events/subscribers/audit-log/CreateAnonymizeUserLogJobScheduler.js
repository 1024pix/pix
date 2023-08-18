import { UserAnonymized } from '../../../../domain/events/UserAnonymized.js';

export class CreateAnonymizeUserLogJobScheduler {
  constructor({ createAnonymizeUserLogJob }) {
    this.createAnonymizeUserLogJob = createAnonymizeUserLogJob;
  }

  static event = UserAnonymized;

  get name() {
    return 'CreateAnonymizeUserLogJobScheduler';
  }

  async handle(event) {
    await this.createAnonymizeUserLogJob.schedule(event);
  }
}
