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
    // attributes
    name,
    externalId,
    type,
    createdAt,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    // includes
    // references
  }

  get isSco() {
    return this.type === types.SCO;
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
