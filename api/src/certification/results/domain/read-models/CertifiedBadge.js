import _ from 'lodash';

class CertifiedBadge {
  constructor({ label, imageUrl, stickerUrl, isTemporaryBadge, message }) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.stickerUrl = stickerUrl;
    this.isTemporaryBadge = isTemporaryBadge;
    this.message = message;
  }

  static fromComplementaryCertificationCourseResults(complementaryCertificationCourseResults) {
    const complementaryCertificationCourseResultsByComplementaryCertificationCourseId = _.groupBy(
      complementaryCertificationCourseResults,
      'complementaryCertificationCourseId',
    );

    return Object.values(complementaryCertificationCourseResultsByComplementaryCertificationCourseId)
      .map((complementaryCertificationCourseResultsForCourseId) => {
        const { label, acquired, hasExternalJury, imageUrl, stickerUrl, certificateMessage } =
          complementaryCertificationCourseResultsForCourseId[0];
        const acquiredCertifiedBadge = {
          label,
          imageUrl,
          stickerUrl,
        };

        if (!acquired) {
          return;
        }

        if (hasExternalJury) {
          return _getAcquiredCertifiedBadgesDTOWithExternalJury(complementaryCertificationCourseResultsForCourseId);
        }

        return new CertifiedBadge({ ...acquiredCertifiedBadge, isTemporaryBadge: false, message: certificateMessage });
      })
      .filter(Boolean);
  }
}

function _getLowestByLevel(complementaryCertificationCourseResults) {
  if (!complementaryCertificationCourseResults.every(({ acquired }) => acquired)) {
    return { acquired: false };
  }
  return _(complementaryCertificationCourseResults).sortBy('level').head();
}

function _getAcquiredCertifiedBadgesDTOWithExternalJury(complementaryCertificationCourseResults) {
  if (complementaryCertificationCourseResults.length === 1) {
    const {
      label,
      imageUrl,
      stickerUrl,
      temporaryCertificateMessage: message,
    } = complementaryCertificationCourseResults[0];
    return new CertifiedBadge({
      label,
      imageUrl,
      stickerUrl,
      message,
      isTemporaryBadge: true,
    });
  }

  const { label, imageUrl, stickerUrl, certificateMessage, acquired } = _getLowestByLevel(
    complementaryCertificationCourseResults,
  );

  if (acquired) {
    return new CertifiedBadge({
      label,
      imageUrl,
      stickerUrl,
      isTemporaryBadge: false,
      message: certificateMessage,
    });
  }
}

export { CertifiedBadge };
