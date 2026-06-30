import { JobRepository } from '../../../../shared/infrastructure/repositories/jobs/job-repository.js';
import { UpdateCombineCourseJob } from '../../../domain/models/combined-course-participations/events/UpdateCombinedCourseJob.js';

class UpdateCombinedCourseJobRepository extends JobRepository {
  constructor() {
    super({
      name: UpdateCombineCourseJob.name,
    });
  }
}

export const updateCombinedCourseJobRepository = new UpdateCombinedCourseJobRepository();
