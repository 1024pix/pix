const { PIX_PLUS_DROIT, CLEA } = require('./ComplementaryCertification');

const SUP = 'SUP';
const SCO = 'SCO';
const PRO = 'PRO';

const types = {
  SUP,
  SCO,
  PRO,
};

class CertificationCenter {
  constructor({ id, name, externalId, type, createdAt, updatedAt, habilitations = [] } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
  }

  get isSco() {
    return this.type === types.SCO;
  }

  get isAccreditedPixPlusDroit() {
    return this.habilitations.some((habilitation) => habilitation.name === PIX_PLUS_DROIT);
  }

  get isAccreditedClea() {
    return this.habilitations.some((habilitation) => habilitation.name === CLEA);
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
