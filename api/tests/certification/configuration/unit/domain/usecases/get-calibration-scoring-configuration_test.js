import sinon from 'sinon';

import { SCORING_MESH_AVAILABILITIES } from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import { getCalibrationScoringConfiguration } from '../../../../../../src/certification/configuration/domain/usecases/get-calibration-scoring-configuration.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-calibration-scoring-configuration', function () {
  let versionRepository, calibrationRepository, draftVersion;

  beforeEach(function () {
    versionRepository = { getById: sinon.stub() };
    calibrationRepository = { find: sinon.stub() };
    draftVersion = domainBuilder.certification.configuration
      .versionBuilder()
      .asDraft({ startDate: null })
      .withParameters({ id: 42 })
      .build();
  });

  context('when version is not found', function () {
    it('throws a NotFoundError', async function () {
      versionRepository.getById.withArgs({ id: 42 }).resolves(null);

      const err = await catchErr(getCalibrationScoringConfiguration)({
        versionId: 42,
        calibrationId: 113,
        versionRepository,
        calibrationRepository,
      });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Cannot find version of id "42"');
    });
  });

  context('when calibration is not found', function () {
    it('throws a NotFoundError', async function () {
      versionRepository.getById.withArgs({ id: 42 }).resolves(draftVersion);
      calibrationRepository.find.withArgs(113).resolves(null);

      const err = await catchErr(getCalibrationScoringConfiguration)({
        versionId: 42,
        calibrationId: 113,
        versionRepository,
        calibrationRepository,
      });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Cannot find calibration of external id "113"');
    });
  });

  context('when the calibration carries a validated scoring mesh set', function () {
    it('returns the proposed global scoring configuration', async function () {
      versionRepository.getById.withArgs({ id: 42 }).resolves(draftVersion);
      calibrationRepository.find.withArgs(113).resolves(
        domainBuilder.certification.configuration
          .calibrationBuilder()
          .withParameters({ id: 113 })
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
          .build(),
      );

      const calibrationScoringConfiguration = await getCalibrationScoringConfiguration({
        versionId: 42,
        calibrationId: 113,
        versionRepository,
        calibrationRepository,
      });

      expect(calibrationScoringConfiguration.availability).to.equal(SCORING_MESH_AVAILABILITIES.AVAILABLE);
      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([
        { meshLevel: 0, bounds: { min: -4.67, max: -1.4 } },
      ]);
    });
  });

  context('when Data has not delivered the scoring mesh set', function () {
    it('returns a pending configuration rather than throwing', async function () {
      versionRepository.getById.withArgs({ id: 42 }).resolves(draftVersion);
      calibrationRepository.find
        .withArgs(113)
        .resolves(domainBuilder.certification.configuration.calibrationBuilder().withParameters({ id: 113 }).build());

      const calibrationScoringConfiguration = await getCalibrationScoringConfiguration({
        versionId: 42,
        calibrationId: 113,
        versionRepository,
        calibrationRepository,
      });

      expect(calibrationScoringConfiguration.availability).to.equal(SCORING_MESH_AVAILABILITIES.PENDING);
      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([]);
    });
  });
});
