import { CERTIFICATION_CENTER_TYPES } from '../constants';

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
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

export default CertificationCenterForAdmin;
export { CERTIFICATION_CENTER_TYPES as types };
