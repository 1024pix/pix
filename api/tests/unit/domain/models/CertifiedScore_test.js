const { expect } = require('../../../test-helper');
const { CertifiedScore } = require('../../../../lib/domain/models/CertifiedScore');
const { CertifiedLevel } = require('../../../../lib/domain/models/CertifiedLevel');

const {
  PIX_COUNT_BY_LEVEL,
} = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | CertifiedScore', function() {
  it('is equal to the estimated score if the estimated level is certified', () => {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.validate(3),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(10);
  });

  it(`is reduced by ${PIX_COUNT_BY_LEVEL} pix if the estimated level is downgraded`, () => {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.downgrade(3),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(10 - PIX_COUNT_BY_LEVEL);
  });

  it('is equal to 0 if the estimated level is uncertified', () => {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.uncertify(),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(0);
  });
});
