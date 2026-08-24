import { expect } from 'chai';

import {
  CALIBRATION_STATUSES,
  SCORING_MESH_AVAILABILITIES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
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

  describe('#scoringMeshSet', function () {
    describe('#availability', function () {
      it('returns PENDING when Data has not delivered any scoring mesh set', function () {
        const calibration = domainBuilder.certification.configuration.calibrationBuilder().build();

        expect(calibration.scoringMeshSet.availability).to.equal(SCORING_MESH_AVAILABILITIES.PENDING);
        expect(calibration.scoringMeshSet.isAvailable).to.be.false;
      });

      it('returns PENDING when the delivered set holds no mesh', function () {
        const calibration = domainBuilder.certification.configuration
          .calibrationBuilder()
          .withScoringMeshes([])
          .build();

        expect(calibration.scoringMeshSet.availability).to.equal(SCORING_MESH_AVAILABILITIES.PENDING);
      });

      it('returns NOT_VALIDATED when the delivered set is not validated', function () {
        const calibration = domainBuilder.certification.configuration
          .calibrationBuilder()
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }], {
            status: CALIBRATION_STATUSES.TO_VALIDATE,
          })
          .build();

        expect(calibration.scoringMeshSet.availability).to.equal(SCORING_MESH_AVAILABILITIES.NOT_VALIDATED);
        expect(calibration.scoringMeshSet.isAvailable).to.be.false;
      });

      it('returns AVAILABLE when the delivered set is validated and holds meshes', function () {
        const calibration = domainBuilder.certification.configuration
          .calibrationBuilder()
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
          .build();

        expect(calibration.scoringMeshSet.availability).to.equal(SCORING_MESH_AVAILABILITIES.AVAILABLE);
        expect(calibration.scoringMeshSet.isAvailable).to.be.true;
      });

      it('does not depend on the calibration own status', function () {
        const calibration = domainBuilder.certification.configuration
          .calibrationBuilder()
          .asInvalidated()
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
          .build();

        expect(calibration.scoringMeshSet.availability).to.equal(SCORING_MESH_AVAILABILITIES.AVAILABLE);
      });
    });
  });
});
