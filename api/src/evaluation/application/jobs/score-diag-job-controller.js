import { JobController } from '../../../shared/application/jobs/job-controller.js';
import { ScoreDiagJob } from '../../domain/events/ScoreDiag.js';
import evaluationUsecases from '../../domain/usecases/index.js';

export class ScoreDiagJobController extends JobController {
  constructor() {
    super(ScoreDiagJob.name);
  }

  async handle({ assessmentId, locale }) {
    // todo
    await evaluationUsecases.ScoreDiagAssessment({ assessmentId, locale });
  }
}
