import { AnswerJob } from '../../../quest/domain/models/AnwserJob.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import { JobRepository } from '../../../shared/infrastructure/repositories/jobs/job-repository.js';

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
    if (
      !(await featureToggles.get('isAsyncQuestRewardingCalculationEnabled')) ||
      !(await featureToggles.get('isQuestEnabled'))
    )
      return;

    await super.performAsync(job);
    await this.#profileRewardTemporaryStorage.increment(job.userId);
  }
}

export const answerJobRepository = new AnswerJobRepository();
