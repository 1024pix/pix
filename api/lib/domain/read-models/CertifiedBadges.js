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
        const label = complementaryCertificationCourseResults[0].label;
        if (complementaryCertificationCourseResults[0].isPixEdu()) {
          if (complementaryCertificationCourseResults.length === 1) {
            if (!complementaryCertificationCourseResults[0].isAcquired()) {
              return;
            }
            return { partnerKey, isTemporaryBadge: true, label };
          }

          if (complementaryCertificationCourseResults.length > 1) {
            if (this._hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults)) {
              return;
            }

            const { partnerKey, label } = this._getLowestPartnerKey(complementaryCertificationCourseResults);

            return { partnerKey, isTemporaryBadge: false, label };
          }
        }

        if (complementaryCertificationCourseResults[0].isAcquired()) {
          return { partnerKey, isTemporaryBadge: false, label };
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

    const lowestResult =
      firstIndexOf <= secondIndexOf
        ? complementaryCertificationCourseResults[0]
        : complementaryCertificationCourseResults[1];

    return { partnerKey: lowestResult.partnerKey, label: lowestResult.label };
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

    const lowestResult =
      firstIndexOf <= secondIndexOf
        ? complementaryCertificationCourseResults[0]
        : complementaryCertificationCourseResults[1];

    return { partnerKey: lowestResult.partnerKey, label: lowestResult.label };
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
