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
  constructor({ complementaryCertificationCourseId, partnerKey, source, acquired } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
    this.source = source;
  }

  static from({ complementaryCertificationCourseId, partnerKey, acquired, source }) {
    return new ComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey,
      acquired,
      source,
    });
  }

  static buildFromJuryLevel({ complementaryCertificationCourseId, juryLevel, pixPartnerKey }) {
    if (juryLevel === 'REJECTED') {
      return new ComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        partnerKey: pixPartnerKey,
        acquired: false,
        source: sources.EXTERNAL,
      });
    }

    return new ComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey: juryLevel,
      acquired: true,
      source: sources.EXTERNAL,
    });
  }

  isFromPixSource() {
    return this.source === sources.PIX;
  }

  isFromExternalSource() {
    return this.source === sources.EXTERNAL;
  }

  isAcquired() {
    return this.acquired;
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
