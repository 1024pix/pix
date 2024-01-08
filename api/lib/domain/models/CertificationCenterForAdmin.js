import { CERTIFICATION_CENTER_TYPES } from '../constants.js';

class CertificationCenterForAdmin {
  constructor({
    id,
    name,
    externalId,
    type,
    createdAt,
    updatedAt,
    habilitations = [],
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
    isV3Pilot = false,
  } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
    this.dataProtectionOfficerFirstName = dataProtectionOfficerFirstName;
    this.dataProtectionOfficerLastName = dataProtectionOfficerLastName;
    this.dataProtectionOfficerEmail = dataProtectionOfficerEmail;
    this.isV3Pilot = isV3Pilot;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

CertificationCenterForAdmin.types = CERTIFICATION_CENTER_TYPES;

export { CertificationCenterForAdmin, CERTIFICATION_CENTER_TYPES as types };
