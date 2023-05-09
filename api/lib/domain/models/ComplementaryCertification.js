const PIX_PLUS_DROIT = 'DROIT';
const CLEA = 'CLEA';
const PIX_PLUS_EDU_1ER_DEGRE = 'EDU_1ER_DEGRE';
const PIX_PLUS_EDU_2ND_DEGRE = 'EDU_2ND_DEGRE';

class ComplementaryCertification {
  constructor({ id, label, key }) {
    this.id = id;
    this.label = label;
    this.key = key;
  }
}

ComplementaryCertification.PIX_PLUS_DROIT = PIX_PLUS_DROIT;
ComplementaryCertification.CLEA = CLEA;
ComplementaryCertification.PIX_PLUS_EDU_1ER_DEGRE = PIX_PLUS_EDU_1ER_DEGRE;
ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE = PIX_PLUS_EDU_2ND_DEGRE;

export { ComplementaryCertification };
