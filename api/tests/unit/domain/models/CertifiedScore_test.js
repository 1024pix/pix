import { expect } from '../../../test-helper';
import { CertifiedScore } from '../../../../lib/domain/models/CertifiedScore';
import { CertifiedLevel } from '../../../../lib/domain/models/CertifiedLevel';
import { PIX_COUNT_BY_LEVEL } from '../../../../lib/domain/constants';

describe('Unit | Domain | Models | CertifiedScore', function () {
  it('is equal to the estimated score if the estimated level is certified', function () {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.validate(3),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(10);
  });

  it(`is reduced by ${PIX_COUNT_BY_LEVEL} pix if the estimated level is downgraded`, function () {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.downgrade(3),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(10 - PIX_COUNT_BY_LEVEL);
  });

  it('is equal to 0 if the estimated level is uncertified', function () {
    // when
    const certifiedScore = CertifiedScore.from({
      certifiedLevel: CertifiedLevel.invalidate(),
      estimatedScore: 10,
    });

    // then
    expect(certifiedScore.value).to.equal(0);
  });
});
