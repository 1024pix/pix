import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { CertificationCompletedJob } from '../../domain/events/CertificationCompleted.js';
import { usecases } from '../../domain/usecases/index.js';

export class CertificationCompletedJobController extends JobController {
  constructor() {
    super(CertificationCompletedJob.name);
  }

  async handle({ data }) {
    const { certificationCourseId, locale } = data;
    await usecases.scoreV3Certification({ certificationCourseId, locale });
  }
}
