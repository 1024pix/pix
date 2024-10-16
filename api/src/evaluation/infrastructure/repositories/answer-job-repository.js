import { AnswerJob } from '../../../quest/domain/models/AnwserJob.js';
import { JobRepository } from '../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { temporaryStorage } from '../../../shared/infrastructure/temporary-storage/index.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

export class AnswerJobRepository extends JobRepository {
  #profileRewardTemporaryStorage;

  constructor({ dependencies = { profileRewardTemporaryStorage } } = {}) {
    super({
      name: AnswerJob.name,
    });
    this.#profileRewardTemporaryStorage = dependencies.profileRewardTemporaryStorage;
  }

  async performAsync(job) {
    super.performAsync(job);
    await this.#profileRewardTemporaryStorage.increment(job.userId);
  }
}

export const answerJobRepository = new AnswerJobRepository();
