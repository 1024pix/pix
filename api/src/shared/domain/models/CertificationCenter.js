import { CERTIFICATION_CENTER_TYPES } from '../constants.js';

class CertificationCenter {
  constructor({ id, name, externalId, type, createdAt, updatedAt, habilitations = [], isV3Pilot = false } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
    this.isV3Pilot = isV3Pilot;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  get hasBillingMode() {
    return this.type !== CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}
CertificationCenter.types = CERTIFICATION_CENTER_TYPES;

export { CertificationCenter, CERTIFICATION_CENTER_TYPES as types };
