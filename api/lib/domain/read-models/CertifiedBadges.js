const _ = require('lodash');
const ComplementaryCertificationCourseResult = require('../models/ComplementaryCertificationCourseResult');

class CertifiedBadges {
  constructor({ complementaryCertificationCourseResults }) {
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
  }

  getAcquiredCertifiedBadgesDTO() {
    const complementaryCertificationCourseResultsByComplementaryCertificationCourseId = _.groupBy(
      this.complementaryCertificationCourseResults,
      'complementaryCertificationCourseId'
    );

    return Object.values(complementaryCertificationCourseResultsByComplementaryCertificationCourseId)
      .map((complementaryCertificationCourseResults) => {
        const { partnerKey, label, acquired, hasExternalJury, imageUrl } = complementaryCertificationCourseResults[0];
        if (hasExternalJury) {
          if (complementaryCertificationCourseResults.length === 1) {
            if (!acquired) {
              return;
            }
            return { partnerKey, isTemporaryBadge: true, label, imageUrl, message: this._getBadgeMessage(true, label) };
          }

          if (complementaryCertificationCourseResults.length > 1) {
            if (this._hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults)) {
              return;
            }

            const { partnerKey, label, imageUrl } = this._getLowestByLevel(complementaryCertificationCourseResults);

            return {
              partnerKey,
              isTemporaryBadge: false,
              label,
              imageUrl,
              message: this._getBadgeMessage(false, label),
            };
          }
        }

        if (acquired) {
          return { partnerKey, isTemporaryBadge: false, label, imageUrl, message: null };
        }
      })
      .filter(Boolean);
  }

  _getLowestByLevel(complementaryCertificationCourseResults) {
    return _(complementaryCertificationCourseResults).sortBy('level').head();
  }

  _hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults) {
    return complementaryCertificationCourseResults.some(
      (complementaryCertificationCourseResult) =>
        !complementaryCertificationCourseResult.acquired &&
        complementaryCertificationCourseResult.source === ComplementaryCertificationCourseResult.sources.EXTERNAL
    );
  }

  _getBadgeMessage(isTemporaryBadge, label) {
    return isTemporaryBadge
      ? `Vous avez obtenu le niveau “${label}” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2`
      : `Vous avez obtenu la certification Pix+Edu niveau "${label}"`;
  }
}

module.exports = CertifiedBadges;
