import { CertificationCandidateForSupervising } from './CertificationCandidateForSupervising.js';

export class CertificationCandidateForSupervisingV3 extends CertificationCandidateForSupervising {
  constructor({ liveAlert = null, ...rest }) {
    super({ ...rest });
    this.liveAlert = liveAlert?.status ? liveAlert : null;
  }
}
