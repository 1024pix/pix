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
    accreditations = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.accreditations = accreditations;
  }

  get isSco() {
    return this.type === types.SCO;
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
