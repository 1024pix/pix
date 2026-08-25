import sinon from 'sinon';

import { getCalibrationScoringConfiguration } from '../../../../../../src/certification/configuration/domain/usecases/get-calibration-scoring-configuration.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-calibration-scoring-configuration', function () {
  let calibrationRepository;

  beforeEach(function () {
    calibrationRepository = { find: sinon.stub() };
  });

  context('when calibration is not found', function () {
    it('throws a NotFoundError', async function () {
      calibrationRepository.find.withArgs(113).resolves(null);

      const err = await catchErr(getCalibrationScoringConfiguration)({
        calibrationId: 113,
        calibrationRepository,
      });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('Cannot find calibration of external id "113"');
    });
  });

  context('when the calibration carries scoring meshes', function () {
    it('returns the proposed global scoring configuration', async function () {
      calibrationRepository.find.withArgs(113).resolves(
        domainBuilder.certification.configuration
          .calibrationBuilder()
          .withParameters({ id: 113 })
          .withScoringMeshes([{ mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 }])
          .build(),
      );

      const calibrationScoringConfiguration = await getCalibrationScoringConfiguration({
        calibrationId: 113,
        calibrationRepository,
      });

      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([
        { meshLevel: 0, bounds: { min: -4.67, max: -1.4 } },
      ]);
    });
  });

  context('when the calibration carries no scoring mesh', function () {
    it('returns an empty configuration rather than throwing', async function () {
      calibrationRepository.find
        .withArgs(113)
        .resolves(domainBuilder.certification.configuration.calibrationBuilder().withParameters({ id: 113 }).build());

      const calibrationScoringConfiguration = await getCalibrationScoringConfiguration({
        calibrationId: 113,
        calibrationRepository,
      });

      expect(calibrationScoringConfiguration.globalScoringConfiguration).to.deep.equal([]);
    });
  });
});
