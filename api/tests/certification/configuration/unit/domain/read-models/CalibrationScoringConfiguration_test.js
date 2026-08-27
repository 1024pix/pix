import { expect } from 'chai';

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
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({ calibration });

      // then
      expect(calibrationScoringConfiguration).to.deep.equal(
        new CalibrationScoringConfiguration({
          calibrationId: 113,
          globalScoringConfiguration: [
            { meshLevel: 0, bounds: { min: -4.67, max: -1.4 } },
            { meshLevel: 1, bounds: { min: -1.4, max: 0.6 } },
          ],
          competencesScoringConfiguration: [],
        }),
      );
    });

    it('returns an empty configuration when the calibration carries no mesh', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({ calibration });

      // then
      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([]);
    });

    it('groups thresholds by competenceId into the competences scoring configuration', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .withScoringThresholds([
          { competenceId: 'recABC', level: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -2 },
          { competenceId: 'recABC', level: 1, minBoundCuratedValue: -2, maxBoundCuratedValue: 0 },
          { competenceId: 'recXYZ', level: 0, minBoundCuratedValue: -3, maxBoundCuratedValue: -1 },
        ])
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({ calibration });

      // then
      expect(calibrationScoringConfiguration.competencesScoringConfiguration).to.deep.equal([
        {
          competenceId: 'recABC',
          values: [
            { competenceLevel: 0, bounds: { min: -4.67, max: -2 } },
            { competenceLevel: 1, bounds: { min: -2, max: 0 } },
          ],
        },
        {
          competenceId: 'recXYZ',
          values: [{ competenceLevel: 0, bounds: { min: -3, max: -1 } }],
        },
      ]);
    });

    it('returns an empty competences scoring configuration when the calibration carries no threshold', function () {
      // given
      const calibration = domainBuilder.certification.configuration
        .calibrationBuilder()
        .withParameters({ id: 113 })
        .build();

      // when
      const calibrationScoringConfiguration = CalibrationScoringConfiguration.fromCalibration({ calibration });

      // then
      expect(calibrationScoringConfiguration.competencesScoringConfiguration).to.deep.equal([]);
    });
  });
});
