import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';

class ComplementaryCertification {
  constructor({ id, label, key }) {
    this.id = id;
    this.label = label;
    this.key = key;
    this.hasComplementaryReferential = key !== ComplementaryCertificationKeys.CLEA;
  }
}

export { ComplementaryCertification };
