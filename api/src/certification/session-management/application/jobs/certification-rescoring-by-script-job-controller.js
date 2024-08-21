import CertificationRescoredByScript from '../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { eventDispatcher } from '../../../../../lib/domain/events/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { CertificationRescoringByScriptJob } from '../../domain/models/CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobController extends JobController {
  constructor() {
    super(CertificationRescoringByScriptJob.name);
  }

  /**
   * @param {Object} event
   * @param {number} event.certificationCourseId
   */
  async handle(
    event,
    dependencies = {
      eventDispatcher,
    },
  ) {
    await dependencies.eventDispatcher.dispatch(new CertificationRescoredByScript(event));
  }
}

export { CertificationRescoringByScriptJobController };
