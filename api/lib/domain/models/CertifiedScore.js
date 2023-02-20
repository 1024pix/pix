import { PIX_COUNT_BY_LEVEL } from '../constants';

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

export default {
  CertifiedScore,
};
