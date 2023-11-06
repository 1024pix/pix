const sources = {
  EXTERNAL: 'EXTERNAL',
  PIX: 'PIX',
};

const juryOptions = {
  REJECTED: 'REJECTED',
  UNSET: 'UNSET',
};

class ComplementaryCertificationCourseResult {
  constructor({ complementaryCertificationCourseId, partnerKey, source, acquired, label } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
    this.source = source;
    this.label = label;
  }

  static from({ complementaryCertificationCourseId, partnerKey, acquired, source, label }) {
    return new ComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      partnerKey,
      acquired,
      source,
      label,
    });
  }

  static buildFromJuryLevel({ complementaryCertificationCourseId, juryLevel, pixPartnerKey }) {
    if (juryLevel === juryOptions.REJECTED) {
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
}

ComplementaryCertificationCourseResult.sources = sources;
ComplementaryCertificationCourseResult.juryOptions = juryOptions;

export { ComplementaryCertificationCourseResult, sources, juryOptions };
