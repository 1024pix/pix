const {
  PIX_PLUS_DROIT,
  CLEA,
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} = require('./ComplementaryCertification');

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

  get isHabilitatedPixPlusDroit() {
    return this.habilitations.some((habilitation) => habilitation.key === PIX_PLUS_DROIT);
  }

  get isHabilitatedPixPlusEdu1erDegre() {
    return this.habilitations.some((habilitation) => habilitation.key === PIX_PLUS_EDU_1ER_DEGRE);
  }

  get isHabilitatedPixPlusEdu2ndDegre() {
    return this.habilitations.some((habilitation) => habilitation.key === PIX_PLUS_EDU_2ND_DEGRE);
  }

  get isHabilitatedClea() {
    return this.habilitations.some((habilitation) => habilitation.key === CLEA);
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

module.exports = CertificationCenter;
module.exports.types = types;
