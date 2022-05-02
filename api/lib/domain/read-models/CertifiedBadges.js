const _ = require('lodash');
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
} = require('../models/Badge').keys;

class CertifiedBadges {
  constructor({ complementaryCertificationCourseResults }) {
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
  }

  getAcquiredCertifiedBadgesDTO() {
    const complementaryCertificationCourseResultsByPartnerKey = _.groupBy(
      this.complementaryCertificationCourseResults,
      'complementaryCertificationCourseId'
    );

    return Object.values(complementaryCertificationCourseResultsByPartnerKey)
      .map((complementaryCertificationCourseResults) => {
        const partnerKey = complementaryCertificationCourseResults[0].partnerKey;
        if (complementaryCertificationCourseResults[0].isPixEdu()) {
          if (complementaryCertificationCourseResults.length === 1) {
            if (!complementaryCertificationCourseResults[0].isAcquired()) {
              return;
            }
            return { partnerKey, isTemporaryBadge: true };
          }

          if (complementaryCertificationCourseResults.length > 1) {
            if (this._hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults)) {
              return;
            }

            const lowestPartnerKey = this._getLowestPartnerKey(complementaryCertificationCourseResults);

            return { partnerKey: lowestPartnerKey, isTemporaryBadge: false };
          }
        }

        if (complementaryCertificationCourseResults[0].isAcquired()) {
          return { partnerKey, isTemporaryBadge: false };
        }
      })
      .filter(Boolean);
  }

  _getLowestPartnerKey(complementaryCertificationCourseResults) {
    if (complementaryCertificationCourseResults[0].isPixEdu2ndDegre()) {
      return this._getLowestPartnerKeyForPixEdu2ndDegreBadge(complementaryCertificationCourseResults);
    }
    if (complementaryCertificationCourseResults[0].isPixEdu1erDegre()) {
      return this._getLowestPartnerKeyForPixEdu1erDegreBadge(complementaryCertificationCourseResults);
    }
  }

  _getLowestPartnerKeyForPixEdu2ndDegreBadge(complementaryCertificationCourseResults) {
    const firstIndexOf = [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ].indexOf(complementaryCertificationCourseResults[0].partnerKey);

    const secondIndexOf = [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ].indexOf(complementaryCertificationCourseResults[1].partnerKey);

    return firstIndexOf <= secondIndexOf
      ? complementaryCertificationCourseResults[0].partnerKey
      : complementaryCertificationCourseResults[1].partnerKey;
  }

  _getLowestPartnerKeyForPixEdu1erDegreBadge(complementaryCertificationCourseResults) {
    const firstIndexOf = [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ].indexOf(complementaryCertificationCourseResults[0].partnerKey);

    const secondIndexOf = [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ].indexOf(complementaryCertificationCourseResults[1].partnerKey);

    return firstIndexOf <= secondIndexOf
      ? complementaryCertificationCourseResults[0].partnerKey
      : complementaryCertificationCourseResults[1].partnerKey;
  }

  _hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults) {
    return complementaryCertificationCourseResults.some(
      (complementaryCertificationCourseResult) =>
        !complementaryCertificationCourseResult.isAcquired() &&
        complementaryCertificationCourseResult.isFromExternalSource()
    );
  }
}

module.exports = CertifiedBadges;
