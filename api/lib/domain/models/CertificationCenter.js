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
  constructor({ id, name, externalId, type, createdAt, accreditations = [] } = {}) {
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

  get isAccreditedPixPlusDroit() {
    return this.accreditations.some((accreditation) => accreditation.name === PIX_PLUS_DROIT);
  }

  get isAccreditedClea() {
    return this.accreditations.some((accreditation) => accreditation.name === CLEA);
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
