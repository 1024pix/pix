import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ParticipationStoreLevelPerTubeJob } from '../../../domain/models/ParticipationStoreLevelPerTubeJob.js';

class ParticipationStoreLevelPerTubeJobRepository extends JobRepository {
  constructor() {
    super({
      name: ParticipationStoreLevelPerTubeJob.name,
      retry: JobRetry.FEW_RETRY,
    });
  }
}

export const participationStoreLevelPerTubeJobRepository = new ParticipationStoreLevelPerTubeJobRepository();
