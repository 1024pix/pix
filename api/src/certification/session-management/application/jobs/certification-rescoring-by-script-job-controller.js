import CertificationRescoredByScript from '../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { eventDispatcher } from '../../../../../lib/domain/events/index.js';

class CertificationRescoringByScriptJobController {
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
