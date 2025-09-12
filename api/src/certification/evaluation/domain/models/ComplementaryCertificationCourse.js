import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';

class ComplementaryCertificationCourse {
  constructor({ complementaryCertificationKey } = {}) {
    this.complementaryCertificationKey = complementaryCertificationKey;
    this.hasComplementaryReferential = complementaryCertificationKey !== ComplementaryCertificationKeys.CLEA;
  }
}

export { ComplementaryCertificationCourse };
