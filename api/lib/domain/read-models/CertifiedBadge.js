import _ from 'lodash';

class CertifiedBadge {
  constructor({ partnerKey, label, imageUrl, stickerUrl, isTemporaryBadge, message }) {
    this.partnerKey = partnerKey;
    this.label = label;
    this.imageUrl = imageUrl;
    this.stickerUrl = stickerUrl;
    this.isTemporaryBadge = isTemporaryBadge;
    this.message = message;
  }

  static fromComplementaryCertificationCourseResults(complementaryCertificationCourseResults) {
    const complementaryCertificationCourseResultsByComplementaryCertificationCourseId = _.groupBy(
      complementaryCertificationCourseResults,
      'complementaryCertificationCourseId'
    );

    return Object.values(complementaryCertificationCourseResultsByComplementaryCertificationCourseId)
      .map((complementaryCertificationCourseResultsForCourseId) => {
        const { partnerKey, label, acquired, hasExternalJury, imageUrl, stickerUrl, certificateMessage } =
          complementaryCertificationCourseResultsForCourseId[0];
        const acquiredCertifiedBadge = {
          partnerKey,
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
      partnerKey,
      label,
      imageUrl,
      stickerUrl,
      temporaryCertificateMessage: message,
    } = complementaryCertificationCourseResults[0];
    return new CertifiedBadge({
      partnerKey,
      label,
      imageUrl,
      stickerUrl,
      message,
      isTemporaryBadge: true,
    });
  }

  const { partnerKey, label, imageUrl, stickerUrl, certificateMessage, acquired } = _getLowestByLevel(
    complementaryCertificationCourseResults
  );

  if (acquired) {
    return new CertifiedBadge({
      partnerKey,
      label,
      imageUrl,
      stickerUrl,
      isTemporaryBadge: false,
      message: certificateMessage,
    });
  }
}

export default CertifiedBadge;
