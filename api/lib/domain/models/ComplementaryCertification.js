const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';

class ComplementaryCertification {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
}

ComplementaryCertification.PIX_PLUS_DROIT = PIX_PLUS_DROIT;
ComplementaryCertification.CLEA = CLEA;

module.exports = ComplementaryCertification;
