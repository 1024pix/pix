import { expect } from 'chai';

import {
  CALIBRATION_STATUSES,
  SCORING_MESH_AVAILABILITIES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import { CalibrationScoringConfiguration } from '../../../../../../src/certification/configuration/domain/read-models/CalibrationScoringConfiguration.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Configuration | Domain | Read-models | Calibration Scoring Configuration', function () {
  describe('#fromCalibration', function () {
    it('translates the datamart meshes into the API global scoring configuration', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .withScoringMeshes([
          { mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 },
          { mesh: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 },
        ])
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({
        versionId: 42,
        calibration,
      });

      // then
      expect(calibrationScoringConfiguration).to.deep.equal(
        new CalibrationScoringConfiguration({
          versionId: 42,
          calibrationId: 113,
          availability: SCORING_MESH_AVAILABILITIES.AVAILABLE,
          globalScoringConfiguration: [
            { meshLevel: 0, bounds: { min: -4.67, max: -1.4 } },
            { meshLevel: 1, bounds: { min: -1.4, max: 0.6 } },
          ],
        }),
      );
      expect(calibrationScoringConfiguration.isAvailable).to.be.true;
    });

    it('returns an empty configuration when Data has not delivered the meshes yet', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({
        versionId: 42,
        calibration,
      });

      // then
      expect(calibrationScoringConfiguration.availability).to.equal(SCORING_MESH_AVAILABILITIES.PENDING);
      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([]);
      expect(calibrationScoringConfiguration.isAvailable).to.be.false;
    });

    it('does not expose the meshes of a set that is not validated', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }], {
          status: CALIBRATION_STATUSES.TO_VALIDATE,
        })
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({
        versionId: 42,
        calibration,
      });

      // then
      expect(calibrationScoringConfiguration.availability).to.equal(SCORING_MESH_AVAILABILITIES.NOT_VALIDATED);
      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([]);
    });
  });
});
