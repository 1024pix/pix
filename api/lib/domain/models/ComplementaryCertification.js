const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';

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
}

ComplementaryCertification.PIX_PLUS_DROIT = PIX_PLUS_DROIT;
ComplementaryCertification.CLEA = CLEA;

module.exports = ComplementaryCertification;
