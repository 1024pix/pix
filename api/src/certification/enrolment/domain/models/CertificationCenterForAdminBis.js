import { CERTIFICATION_CENTER_TYPES } from '../../../../../lib/domain/constants.js';

class CertificationCenterForAdminBis {
  constructor({ certificationCenter, dataProtectionOfficer } = {}) {
    this.id = certificationCenter.id;
    this.type = certificationCenter.type;
    this.habilitations = certificationCenter.habilitations;
    this.name = certificationCenter.name;
    this.externalId = certificationCenter.externalId;
    this.createdAt = certificationCenter.created_at;
    this.updatedAt = certificationCenter.updatedAt;
    this.isV3Pilot = certificationCenter.isV3Pilot;
    this.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
    this.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
    this.dataProtectionOfficerEmail = dataProtectionOfficer.email;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

CertificationCenterForAdminBis.types = CERTIFICATION_CENTER_TYPES;

export { CertificationCenterForAdminBis, CERTIFICATION_CENTER_TYPES as types };
