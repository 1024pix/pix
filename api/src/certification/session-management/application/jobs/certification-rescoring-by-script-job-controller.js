import CertificationRescoredByScript from '../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { eventDispatcher } from '../../../../../lib/domain/events/index.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { CertificationRescoringByScriptJob } from '../../domain/models/CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobController extends JobController {
  constructor() {
    super(CertificationRescoringByScriptJob.name);
  }

  /**
   * @param {Object} data
   * @param {number} data.certificationCourseId
   */
  async handle({
    data,
    dependencies = {
      eventDispatcher,
    },
  }) {
    await dependencies.eventDispatcher.dispatch(new CertificationRescoredByScript(data));
  }
}

export { CertificationRescoringByScriptJobController };
