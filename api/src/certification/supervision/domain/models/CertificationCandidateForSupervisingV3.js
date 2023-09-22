import { CertificationCandidateForSupervising } from '../../../../../lib/domain/models/index.js';

export class CertificationCandidateForSupervisingV3 extends CertificationCandidateForSupervising {
  constructor({ liveAlertStatus = null, ...rest }) {
    super({ ...rest });
    this.liveAlertStatus = liveAlertStatus;
  }
}
