import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ScoreCertificationJob } from '../../../configuration/domain/models/ScoreCertificationJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ScoreCertificationJobController extends JobController {
  constructor() {
    super(ScoreCertificationJob.name);
  }

  async handle({ data }) {
    const { certificationCourseId } = data;
    await usecases.scoreV3Certification({ certificationCourseId });
  }
}
