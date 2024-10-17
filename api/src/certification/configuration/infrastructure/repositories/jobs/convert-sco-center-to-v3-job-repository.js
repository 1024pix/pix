import { JobRepository, JobRetry } from '../../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { ConvertScoCenterToV3Job } from '../../../domain/models/ConvertScoCenterToV3Job.js';

class ConvertScoCenterToV3JobRepository extends JobRepository {
  constructor() {
    super({
      name: ConvertScoCenterToV3Job.name,
      retry: JobRetry.HIGH_RETRY,
    });
  }
}

export const convertScoCenterToV3JobRepository = new ConvertScoCenterToV3JobRepository();
