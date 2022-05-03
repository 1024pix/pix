const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';
const PIX_PLUS_EDU = 'Pix+ Édu';
const PIX_PLUS_EDU_1ER_DEGRE = 'Pix+ Édu 1er degré';
const PIX_PLUS_EDU_2ND_DEGRE = 'Pix+ Édu 2nd degré';

class ComplementaryCertification {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }

  isClea() {
    return this.name === CLEA;
  }

  isPixPlusDroit() {
    return this.name === PIX_PLUS_DROIT;
  }

  isPixPlusEdu1erDegre() {
    return this.name === PIX_PLUS_EDU_1ER_DEGRE;
  }

  isPixPlusEdu2ndDegre() {
    return this.name === PIX_PLUS_EDU_2ND_DEGRE;
  }
}

ComplementaryCertification.PIX_PLUS_DROIT = PIX_PLUS_DROIT;
ComplementaryCertification.CLEA = CLEA;
ComplementaryCertification.PIX_PLUS_EDU = PIX_PLUS_EDU;
ComplementaryCertification.PIX_PLUS_EDU_1ER_DEGRE = PIX_PLUS_EDU_1ER_DEGRE;
ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE = PIX_PLUS_EDU_2ND_DEGRE;

module.exports = ComplementaryCertification;
