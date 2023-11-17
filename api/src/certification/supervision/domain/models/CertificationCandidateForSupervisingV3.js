import { CertificationCandidateForSupervising } from '../../../../../lib/domain/models/index.js';

export class CertificationCandidateForSupervisingV3 extends CertificationCandidateForSupervising {
  constructor({ liveAlert = null, ...rest }) {
    super({ ...rest });
    this.liveAlert = liveAlert?.status ? liveAlert : null;
  }
}
