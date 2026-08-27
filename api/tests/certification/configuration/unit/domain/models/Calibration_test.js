import { expect } from 'chai';

import {
  CALIBRATION_SCOPES,
  CalibrationScoringMesh,
  fromCalibrationScope,
  toCalibrationScope,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
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

  describe('#toCalibrationScope', function () {
    it('translates every certification scope into its Data counterpart', function () {
      expect(toCalibrationScope(SCOPES.CORE)).to.equal(CALIBRATION_SCOPES.CORE);
      expect(toCalibrationScope(SCOPES.PIX_PLUS_DROIT)).to.equal(CALIBRATION_SCOPES.DROIT);
      expect(toCalibrationScope(SCOPES.PIX_PLUS_EDU_1ER_DEGRE)).to.equal(CALIBRATION_SCOPES.EDU_1ER_DEGRE);
      expect(toCalibrationScope(SCOPES.PIX_PLUS_EDU_2ND_DEGRE)).to.equal(CALIBRATION_SCOPES.EDU_2ND_DEGRE);
      expect(toCalibrationScope(SCOPES.PIX_PLUS_EDU_CPE)).to.equal(CALIBRATION_SCOPES.EDU_CPE);
      expect(toCalibrationScope(SCOPES.PIX_PLUS_PRO_SANTE)).to.equal(CALIBRATION_SCOPES.PRO_SANTE);
    });

    it('returns undefined for an unknown scope', function () {
      expect(toCalibrationScope('UNKNOWN')).to.be.undefined;
    });
  });

  describe('#fromCalibrationScope', function () {
    it('is the exact inverse of toCalibrationScope', function () {
      for (const scope of Object.values(SCOPES)) {
        expect(fromCalibrationScope(toCalibrationScope(scope))).to.equal(scope);
      }
    });

    it('returns undefined for an unknown calibration scope', function () {
      expect(fromCalibrationScope('UNKNOWN')).to.be.undefined;
    });
  });
});
