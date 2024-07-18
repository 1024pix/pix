import { CertificationRescoringByScriptJob } from './CertificationRescoringByScriptJob.js';

class CertificationRescoringByScriptJobHandler {
  constructor({ logger }) {
    this.logger = logger;
  }

  handle(event) {
    this.logger.info({
      data: event.certificationCourseId,
    });
  }

  get name() {
    return CertificationRescoringByScriptJob.name;
  }
}

export { CertificationRescoringByScriptJobHandler };
