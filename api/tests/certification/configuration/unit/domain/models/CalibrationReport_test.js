import { expect } from 'chai';
import sinon from 'sinon';

import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
  SCORING_MESH_AVAILABILITIES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import {
  ALERT_LEVELS,
  buildReport,
  REPORT_LABELS,
} from '../../../../../../src/certification/configuration/domain/models/CalibrationReport.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Configuration | Domain | Models | Calibration Report', function () {
  const now = new Date('2025-06-15T12:00:00Z');
  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  describe('#build', function () {
    context('computing diffs between version and calibration in terms of learning content perimeter', function () {
      let calibrationBuilder, commonReportLines;
      beforeEach(function () {
        calibrationBuilder = domainBuilder.certification.configuration
          .calibrationBuilder()
          .onScope({ scope: CALIBRATION_SCOPES.COEUR })
          .asValidated({ startedAt: new Date() });

        commonReportLines = [
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
            content: 3,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STARTED_AT,
            content: new Date(),
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_SCOPE,
            content: SCOPES.CORE,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STATUS,
            content: CALIBRATION_STATUSES.VALIDATED,
          },
        ];
      });

      context('when some tubes are in the version but not in the calibration', function () {
        it('adds a dedicated report line', function () {
          const version = domainBuilder.certification.configuration
            .versionBuilder()
            .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA', 'tubeC', 'tubeD', 'tubeE'] })
            .build();
          const calibration = calibrationBuilder
            .withCalibratredChallenges([{ tubeId: 'tubeA' }, { tubeId: 'tubeA' }, { tubeId: 'tubeD' }])
            .build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'tubeC, tubeE',
              alertLevel: ALERT_LEVELS.LOW,
              label: REPORT_LABELS.TUBE_ONLY_IN_VERSION_COUNT,
              content: 2,
            },
          ]);
        });
      });

      context('when some tubes are in the calibration but not in the version', function () {
        it('adds a dedicated report line', function () {
          const version = domainBuilder.certification.configuration
            .versionBuilder()
            .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
            .build();
          const calibration = calibrationBuilder
            .withCalibratredChallenges([{ tubeId: 'tubeA' }, { tubeId: 'tubeD' }, { tubeId: 'tubeF' }])
            .build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'tubeD, tubeF',
              alertLevel: ALERT_LEVELS.HIGH,
              label: REPORT_LABELS.TUBE_ONLY_IN_CALIBRATION_COUNT,
              content: 2,
            },
          ]);
        });
      });
    });

    context('computing info related to start date of the calibration', function () {
      let calibrationBuilder, version, commonReportLines;
      beforeEach(function () {
        calibrationBuilder = domainBuilder.certification.configuration
          .calibrationBuilder()
          .onScope({ scope: CALIBRATION_SCOPES.COEUR })
          .withCalibratredChallenges([{ tubeId: 'tubeA' }]);
        version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
          .build();

        commonReportLines = [
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
            content: 1,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_SCOPE,
            content: SCOPES.CORE,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STATUS,
            content: CALIBRATION_STATUSES.VALIDATED,
          },
        ];
      });

      context('when calibration preparation started during last 6 months', function () {
        it('adds a dedicated report line with no alert level', function () {
          const closeToSixMonthsAgo = new Date('2024-12-15T13:00:00Z');
          const calibration = calibrationBuilder.asValidated({ startedAt: closeToSixMonthsAgo }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: null,
              label: REPORT_LABELS.CALIBRATION_STARTED_AT,
              content: new Date('2024-12-15T13:00:00Z'),
              alertLevel: null,
            },
          ]);
        });
      });

      context('when calibration preparation started within 1 year ago and 6 months ago', function () {
        it('adds a dedicated report line with a low alert level', function () {
          const closeToOneYearAgo = new Date('2024-06-15T13:00:00Z');
          const calibration = calibrationBuilder.asValidated({ startedAt: closeToOneYearAgo }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'La calibration a été démarrée depuis plus de 6 mois',
              alertLevel: ALERT_LEVELS.LOW,
              label: REPORT_LABELS.CALIBRATION_STARTED_AT,
              content: new Date('2024-06-15T13:00:00Z'),
            },
          ]);
        });
      });

      context('when calibration preparation started before 1 year ago', function () {
        it('adds a dedicated report line with a high alert level', function () {
          const aBitBeyondOneYearAgo = new Date('2024-06-15T11:59:00Z');
          const calibration = calibrationBuilder.asValidated({ startedAt: aBitBeyondOneYearAgo }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: "La calibration a été démarrée depuis plus d'1 an",
              alertLevel: ALERT_LEVELS.HIGH,
              label: REPORT_LABELS.CALIBRATION_STARTED_AT,
              content: new Date('2024-06-15T11:59:00Z'),
            },
          ]);
        });
      });
    });

    context('computing info related to scope of the calibration', function () {
      let calibrationBuilder, version, commonReportLines;
      beforeEach(function () {
        calibrationBuilder = domainBuilder.certification.configuration
          .calibrationBuilder()
          .asValidated({ startedAt: new Date() })
          .withCalibratredChallenges([{ tubeId: 'tubeA' }]);
        version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
          .build();

        commonReportLines = [
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
            content: 1,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STATUS,
            content: CALIBRATION_STATUSES.VALIDATED,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STARTED_AT,
            content: new Date(),
          },
        ];
      });

      context('when calibration is not on the same scope of the version', function () {
        it('adds a dedicated report line with high alert level', function () {
          const calibration = calibrationBuilder.onScope({ scope: CALIBRATION_SCOPES.PRO_SANTE }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'La calibration ne concerne pas le même référentiel que la version',
              alertLevel: ALERT_LEVELS.HIGH,
              label: REPORT_LABELS.CALIBRATION_SCOPE,
              content: SCOPES.PIX_PLUS_PRO_SANTE,
            },
          ]);
        });
      });

      context('when calibration is on the same scope of the version', function () {
        it('adds a dedicated report line with no alert level', function () {
          const calibration = calibrationBuilder.onScope({ scope: CALIBRATION_SCOPES.COEUR }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: null,
              alertLevel: null,
              label: REPORT_LABELS.CALIBRATION_SCOPE,
              content: SCOPES.CORE,
            },
          ]);
        });
      });
    });

    context('computing info related to status of the calibration', function () {
      let calibrationBuilder, version, commonReportLines;
      beforeEach(function () {
        calibrationBuilder = domainBuilder.certification.configuration
          .calibrationBuilder()
          .onScope({ scope: CALIBRATION_SCOPES.COEUR })
          .withCalibratredChallenges([{ tubeId: 'tubeA' }]);
        version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
          .build();

        commonReportLines = [
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
            content: 1,
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_STARTED_AT,
            content: new Date(),
          },
          {
            additionalContent: null,
            alertLevel: null,
            label: REPORT_LABELS.CALIBRATION_SCOPE,
            content: SCOPES.CORE,
          },
        ];
      });

      context('when calibration is in status VALIDATED', function () {
        it('adds a dedicated report line with no alert level', function () {
          const calibration = calibrationBuilder.asValidated({ startedAt: new Date() }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: null,
              alertLevel: null,
              label: REPORT_LABELS.CALIBRATION_STATUS,
              content: CALIBRATION_STATUSES.VALIDATED,
            },
          ]);
        });
      });

      context('when calibration is in status INVALIDATED', function () {
        it('adds a dedicated report line with high alert level', function () {
          const calibration = calibrationBuilder.asInvalidated({ startedAt: new Date() }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'La calibration ne semble pas encore finalisée',
              alertLevel: ALERT_LEVELS.HIGH,
              label: REPORT_LABELS.CALIBRATION_STATUS,
              content: CALIBRATION_STATUSES.INVALIDATED,
            },
          ]);
        });
      });

      context('when calibration is in status TO_VALIDATE', function () {
        it('adds a dedicated report line with high alert level', function () {
          const calibration = calibrationBuilder.asToValidate({ startedAt: new Date() }).build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            ...commonReportLines,
            {
              additionalContent: 'La calibration ne semble pas encore finalisée',
              alertLevel: ALERT_LEVELS.HIGH,
              label: REPORT_LABELS.CALIBRATION_STATUS,
              content: CALIBRATION_STATUSES.TO_VALIDATE,
            },
          ]);
        });
      });
    });

    context('computing info related to the scoring mesh set availability', function () {
      let calibrationBuilder, version;
      beforeEach(function () {
        calibrationBuilder = domainBuilder.certification.configuration
          .calibrationBuilder()
          .onScope({ scope: CALIBRATION_SCOPES.COEUR })
          .asValidated({ startedAt: new Date() })
          .withCalibratredChallenges([{ tubeId: 'tubeA' }]);
        version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'] })
          .build();
      });

      context('when Data delivered a validated scoring mesh set', function () {
        it('adds a dedicated report line with no alert level', function () {
          const calibration = calibrationBuilder
            .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
            .build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            {
              additionalContent: null,
              alertLevel: null,
              label: REPORT_LABELS.SCORING_MESH_AVAILABILITY,
              content: SCORING_MESH_AVAILABILITIES.AVAILABLE,
            },
          ]);
        });
      });

      context('when Data has not delivered any scoring mesh set', function () {
        it('adds a dedicated report line with low alert level, since some scopes never get one', function () {
          const calibration = calibrationBuilder.build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            {
              additionalContent:
                "Les bornes de capacités par mailles de cette calibration n'ont pas encore été livrées",
              alertLevel: ALERT_LEVELS.LOW,
              label: REPORT_LABELS.SCORING_MESH_AVAILABILITY,
              content: SCORING_MESH_AVAILABILITIES.PENDING,
            },
          ]);
        });
      });

      context('when the delivered scoring mesh set is not validated', function () {
        it('adds a dedicated report line with low alert level', function () {
          const calibration = calibrationBuilder
            .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }], {
              status: CALIBRATION_STATUSES.TO_VALIDATE,
            })
            .build();

          const report = buildReport({ version, calibration });

          expect(report.reportLines).to.deep.include.members([
            {
              additionalContent: 'Les bornes de capacités par mailles de cette calibration ne sont pas validées',
              alertLevel: ALERT_LEVELS.LOW,
              label: REPORT_LABELS.SCORING_MESH_AVAILABILITY,
              content: SCORING_MESH_AVAILABILITIES.NOT_VALIDATED,
            },
          ]);
        });
      });
    });
  });
});
