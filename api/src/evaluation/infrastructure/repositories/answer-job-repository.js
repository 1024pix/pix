import { AnswerJob } from '../../../quest/domain/models/AnwserJob.js';
import { JobRepository } from '../../../shared/infrastructure/repositories/jobs/job-repository.js';

class AnswerJobRepository extends JobRepository {
  constructor() {
    super({
      name: AnswerJob.name,
    });
  }
}

export const answerJobRepository = new AnswerJobRepository();
