import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';

class ComplementaryCertification {
  constructor({ id, label, key, duration }) {
    this.id = id;
    this.label = label;
    this.key = key;
    this.duration = duration;
    this.hasComplementaryReferential = key !== ComplementaryCertificationKeys.CLEA;
  }
}

export { ComplementaryCertification };
