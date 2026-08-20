import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Configuration | Domain | Models | Calibration', function () {
  describe('#challengeCount', function () {
    it('returns 0 when no calibrated challenges', function () {
      const calibration = domainBuilder.certification.configuration.calibrationBuilder().build();

      expect(calibration.challengeCount).to.equal(0);
    });

    it('returns the challenge count when there are some challenges', function () {
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withCalibratredChallenges([
          { alpha: 1, delta: 2 },
          { alpha: 3, delta: 4 },
          { alpha: 5, delta: 6 },
        ])
        .build();

      expect(calibration.challengeCount).to.equal(3);
    });
  });
  describe('#tubeIds', function () {
    it('returns a Set with the tubeIds of the challenges', function () {
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withCalibratredChallenges([
          { tubeId: 'tubeB' },
          { tubeId: 'tubeA' },
          { tubeId: 'tubeB' },
          { tubeId: 'tubeA' },
          { tubeId: 'tubeC' },
        ])
        .build();

      expect(calibration.tubeIds).to.deep.equal(new Set(['tubeA', 'tubeB', 'tubeC']));
    });
  });
});
