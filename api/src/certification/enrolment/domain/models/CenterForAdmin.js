import { CERTIFICATION_CENTER_TYPES } from '../../../../../lib/domain/constants.js';

class CenterForAdmin {
  constructor({ center, dataProtectionOfficer } = {}) {
    this.id = center.id;
    this.type = center.type;
    this.habilitations = center.habilitations;
    this.name = center.name;
    this.externalId = center.externalId;
    this.createdAt = center.createdAt;
    this.updatedAt = center.updatedAt;
    this.isComplementaryAlonePilot = center.isComplementaryAlonePilot;
    this.isV3Pilot = center.isV3Pilot;
    this.dataProtectionOfficerFirstName = dataProtectionOfficer?.firstName;
    this.dataProtectionOfficerLastName = dataProtectionOfficer?.lastName;
    this.dataProtectionOfficerEmail = dataProtectionOfficer?.email;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

CenterForAdmin.types = CERTIFICATION_CENTER_TYPES;

export { CenterForAdmin, CERTIFICATION_CENTER_TYPES as types };
