import { SetUserLastLoggedAtJob } from './SetUserLastLoggedAtJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class SetUserLastLoggedAtJobHandler {
  async handle(event) {
    const { userId } = event;
    return usecases.setUserLastLoggedAt({ userId });
  }

  get name() {
    return SetUserLastLoggedAtJob.name;
  }
}

export { SetUserLastLoggedAtJobHandler };
