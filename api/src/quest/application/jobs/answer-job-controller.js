import { JobController, JobGroup } from '../../../shared/application/jobs/job-controller.js';
import { AnswerJob } from '../../domain/models/AnwserJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class AnswerJobController extends JobController {
  constructor() {
    super(AnswerJob.name, { jobGroup: JobGroup.FAST });
  }

  async handle({ data }) {
    const { userId } = data;

    return usecases.rewardUser({ userId });
  }
}
