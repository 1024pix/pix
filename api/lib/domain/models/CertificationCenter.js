const SUP = 'SUP';
const SCO = 'SCO';
const PRO = 'PRO';

const types = {
  SUP,
  SCO,
  PRO,
};

class CertificationCenter {
  constructor({
    id,
    name,
    externalId,
    type,
    createdAt,
    updatedAt,
    habilitations = [],
    isSupervisorAccessEnabled = false,
  } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
    this.isSupervisorAccessEnabled = isSupervisorAccessEnabled;
  }

  get isSco() {
    return this.type === types.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
