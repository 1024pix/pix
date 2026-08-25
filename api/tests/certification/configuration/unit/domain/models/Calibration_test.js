import { expect } from 'chai';

import { CalibrationScoringMesh } from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
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

  describe('#scoringMeshes', function () {
    it('is empty when Data has not delivered any scoring mesh', function () {
      const calibration = domainBuilder.certification.configuration.calibrationBuilder().build();

      expect(calibration.scoringMeshes).to.deep.equal([]);
    });

    it('carries the delivered meshes', function () {
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
        .build();

      expect(calibration.scoringMeshes).to.deep.equal([
        new CalibrationScoringMesh({ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }),
      ]);
    });

    it('does not depend on the calibration own status', function () {
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .asInvalidated()
        .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
        .build();

      expect(calibration.scoringMeshes).to.have.lengthOf(1);
    });
  });
});
