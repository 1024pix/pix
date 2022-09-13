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
            return { partnerKey, isTemporaryBadge: true, label, imageUrl };
          }

          if (complementaryCertificationCourseResults.length > 1) {
            if (this._hasRejectedJuryCertifiedBadge(complementaryCertificationCourseResults)) {
              return;
            }

            const { partnerKey, label, imageUrl } = this._getLowestByLevel(complementaryCertificationCourseResults);

            return { partnerKey, isTemporaryBadge: false, label, imageUrl };
          }
        }

        if (acquired) {
          return { partnerKey, isTemporaryBadge: false, label, imageUrl };
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
}

module.exports = CertifiedBadges;
