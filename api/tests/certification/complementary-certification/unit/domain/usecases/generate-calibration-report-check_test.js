import { expect } from 'chai';
import sinon from 'sinon';

import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import { REPORT_LABELS } from '../../../../../../src/certification/configuration/domain/models/CalibrationReport.js';
import { generateCalibrationReportCheck } from '../../../../../../src/certification/configuration/domain/usecases/generate-calibration-report-check.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | generate-calibration-report-check', function () {
  let versionRepository, calibrationRepository, dependencies;
  const now = new Date('2025-06-15T12:00:00Z');

  beforeEach(function () {
    sinon.useFakeTimers({ now, toFake: ['Date'] });
    versionRepository = {
      getById: sinon.stub(),
    };

    calibrationRepository = {
      findLatestForReport: sinon.stub(),
    };

    dependencies = {
      versionRepository,
      calibrationRepository,
    };
  });

  context('when version does not exist', function () {
    it('throws a NotFound error', async function () {
      versionRepository.getById.withArgs({ id: 1 }).resolves(null);

      const err = await catchErr(generateCalibrationReportCheck)({
        versionId: 1,
        ...dependencies,
      });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Cannot find version of id "1"');
    });
  });

  context('when no calibration exists for the scope of the version', function () {
    it('throws a NotFound error', async function () {
      versionRepository.getById
        .withArgs({ id: 1 })
        .resolves(
          domainBuilder.certification.configuration
            .versionBuilder()
            .withParameters({ id: 1, scope: SCOPES.PIX_PLUS_DROIT })
            .build(),
        );
      calibrationRepository.findLatestForReport.withArgs({ scope: SCOPES.PIX_PLUS_DROIT }).resolves(null);

      const err = await catchErr(generateCalibrationReportCheck)({
        versionId: 1,
        ...dependencies,
      });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Cannot find any calibration for scope "DROIT"');
    });
  });

  context('when version and calibration found', function () {
    it('returns the report of the latest calibration of the version scope', async function () {
      versionRepository.getById.withArgs({ id: 1 }).resolves(
        domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ id: 1, scope: SCOPES.CORE, tubeIds: ['tubeA'] })
          .build(),
      );
      calibrationRepository.findLatestForReport.withArgs({ scope: SCOPES.CORE }).resolves(
        domainBuilder.certification.configuration
          .calibrationBuilder()
          .onScope({ scope: CALIBRATION_SCOPES.COEUR })
          .withCalibratredChallenges([{ tubeId: 'tubeA', locales: ['fr', 'en'] }])
          .asValidated({ startedAt: new Date() })
          .withParameters({ id: 2 })
          .buildForReport(),
      );

      const report = await generateCalibrationReportCheck({
        versionId: 1,
        ...dependencies,
      });

      expect(report.generatedAt).to.deep.equal(now);
      expect(report.versionId).to.equal(1);
      expect(report.calibrationId).to.equal(2);
      expect(report.reportLines).to.deep.include.members([
        {
          additionalContent: null,
          alertLevel: null,
          content: 1,
          label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
        },
        {
          additionalContent: null,
          alertLevel: null,
          content: 1,
          label: REPORT_LABELS.ENGLISH_CALIBRATED_CHALLENGE_COUNT,
        },
        {
          additionalContent: null,
          alertLevel: null,
          content: new Date(),
          label: REPORT_LABELS.CALIBRATION_STARTED_AT,
        },
        {
          additionalContent: null,
          alertLevel: null,
          content: SCOPES.CORE,
          label: REPORT_LABELS.CALIBRATION_SCOPE,
        },
        {
          additionalContent: null,
          alertLevel: null,
          content: CALIBRATION_STATUSES.VALIDATED,
          label: REPORT_LABELS.CALIBRATION_STATUS,
        },
      ]);
    });
  });
});
