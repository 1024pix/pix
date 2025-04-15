import { CERTIFICATION_FEATURES } from '../../../certification/shared/domain/constants.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../shared/domain/constants.js';

class CertificationCenter {
  constructor({
    id,
    name,
    externalId,
    type,
    createdAt,
    updatedAt,
    habilitations = [],
    features = [],
    archivedAt,
    archivedBy,
  } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
    this.features = features;
    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
  }

  get isComplementaryAlonePilot() {
    return this.features.includes(CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key);
  }
}

CertificationCenter.types = CERTIFICATION_CENTER_TYPES;

export { CertificationCenter, CERTIFICATION_CENTER_TYPES as types };
