const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';
const PIX_PLUS_EDU = 'Pix+ Édu';

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

  isPixPlusEdu() {
    return this.name === PIX_PLUS_EDU;
  }
}

ComplementaryCertification.PIX_PLUS_DROIT = PIX_PLUS_DROIT;
ComplementaryCertification.CLEA = CLEA;
ComplementaryCertification.PIX_PLUS_EDU = PIX_PLUS_EDU;

module.exports = ComplementaryCertification;
