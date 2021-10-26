const SUP = 'SUP';
const SCO = 'SCO';
const PRO = 'PRO';

const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';

const types = {
  SUP,
  SCO,
  PRO,
};

class CertificationCenter {
  constructor({ id, name, externalId, type, createdAt, habilitations = [] } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
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
