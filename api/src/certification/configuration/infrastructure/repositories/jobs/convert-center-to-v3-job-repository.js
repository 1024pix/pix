import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ConvertCenterToV3Job } from '../../../domain/models/ConvertCenterToV3Job.js';

class ConvertCenterToV3JobRepository extends JobRepository {
  constructor() {
    super({
      name: ConvertCenterToV3Job.name,
      retry: JobRetry.HIGH_RETRY,
    });
  }
}

export const convertCenterToV3JobRepository = new ConvertCenterToV3JobRepository();
