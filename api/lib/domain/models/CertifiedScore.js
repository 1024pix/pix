const { PIX_COUNT_BY_LEVEL } = require('../constants.js');

class CertifiedScore {
  constructor(value) {
    this.value = value;
  }
  static from({ certifiedLevel, estimatedScore }) {
    if (certifiedLevel.isUncertified()) {
      return new CertifiedScore(0);
    }
    if (certifiedLevel.isDowngraded()) {
      return new CertifiedScore(estimatedScore - PIX_COUNT_BY_LEVEL);
    }
    return new CertifiedScore(estimatedScore);
  }
}

module.exports = {
  CertifiedScore,
};
