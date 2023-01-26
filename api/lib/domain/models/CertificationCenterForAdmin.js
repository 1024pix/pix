const { CERTIFICATION_CENTER_TYPES } = require('../constants');

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

module.exports = CertificationCenterForAdmin;
module.exports.types = CERTIFICATION_CENTER_TYPES;
