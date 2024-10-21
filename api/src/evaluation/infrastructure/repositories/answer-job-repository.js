import { AnswerJob } from '../../../quest/domain/models/AnwserJob.js';
import { config } from '../../../shared/config.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
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
    if (!config.featureToggles.isAsyncQuestRewardingCalculationEnabled || !config.featureToggles.isQuestEnabled) return;

    const knexConn = DomainTransaction.getConnection();

    if (knexConn.isTransaction) {
      await super.performAsync(job);
      await this.#profileRewardTemporaryStorage.increment(job.userId);
    } else {
      await DomainTransaction.execute(async () => {
        await super.performAsync(job);
        await this.#profileRewardTemporaryStorage.increment(job.userId);
      });
    }
  }
}

export const answerJobRepository = new AnswerJobRepository();
