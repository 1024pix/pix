import CertificationRescoredByScript from '../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { CertificationRescoringByScriptJob } from './CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobHandler {
  constructor({ eventDispatcher }) {
    this.eventDispatcher = eventDispatcher;
  }

  /**
   * @param {Object} event
   * @param {number} event.certificationCourseId
   */
  async handle(event) {
    await this.eventDispatcher.dispatch(new CertificationRescoredByScript(event));
  }

  get name() {
    return CertificationRescoringByScriptJob.name;
  }
}

export { CertificationRescoringByScriptJobHandler };
