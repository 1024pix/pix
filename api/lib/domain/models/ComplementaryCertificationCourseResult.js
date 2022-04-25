const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('./Badge').keys;

const sources = {
  EXTERNAL: 'EXTERNAL',
  PIX: 'PIX',
};

class ComplementaryCertificationCourseResult {
  constructor({ certificationCourseId, complementaryCertificationCourseId, partnerKey, source, acquired } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
    this.source = source;
  }

  static from({ certificationCourseId, complementaryCertificationCourseId, partnerKey, acquired, source }) {
    return new ComplementaryCertificationCourseResult({
      certificationCourseId,
      complementaryCertificationCourseId,
      partnerKey,
      acquired,
      source,
    });
  }

  isPixEdu() {
    return this.isPixEdu1erDegre() || this.isPixEdu2ndDegre();
  }

  isPixEdu1erDegre() {
    return [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ].includes(this.partnerKey);
  }

  isPixEdu2ndDegre() {
    return [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ].includes(this.partnerKey);
  }
}

ComplementaryCertificationCourseResult.sources = sources;

module.exports = ComplementaryCertificationCourseResult;
