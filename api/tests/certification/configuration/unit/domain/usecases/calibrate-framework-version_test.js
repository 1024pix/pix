import sinon from 'sinon';

import { calibrateFrameworkVersion } from '../../../../../../src/certification/configuration/domain/usecases/calibrate-framework-version.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | calibrate-framework-version', function () {
  let frameworkChallengesRepository, activeCalibratedChallengeRepository, versionRepository, version;

  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());

    version = domainBuilder.certification.configuration.buildVersion({
      scope: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
    });

    frameworkChallengesRepository = {
      getByVersionId: sinon.stub(),
      update: sinon.stub(),
    };

    activeCalibratedChallengeRepository = {
      getByScopeAndCalibrationId: sinon.stub(),
    };

    versionRepository = {
      getById: sinon.stub(),
    };
  });

  describe('when framework has as many challenges as active calibrated ones', function () {
    it('calibrates the framework challenges', async function () {
      // given
      const calibrationId = 1;
      const versionId = 123;

      const challenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec1234',
          discriminant: null,
          difficulty: null,
        }),
      ];

      const activeCalibratedChallenges = [
        domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
          scope: version.scope,
          challengeId: challenges[0].challengeId,
          discriminant: 1.4,
          difficulty: 2.2,
        }),
      ];

      versionRepository.getById.withArgs({ id: versionId }).resolves(version);

      frameworkChallengesRepository.getByVersionId.withArgs({ versionId }).resolves(challenges);

      activeCalibratedChallengeRepository.getByScopeAndCalibrationId
        .withArgs({
          scope: version.scope,
          calibrationId,
        })
        .resolves(activeCalibratedChallenges);

      // when
      await calibrateFrameworkVersion({
        versionId,
        calibrationId,
        frameworkChallengesRepository,
        activeCalibratedChallengeRepository,
        versionRepository,
      });

      // then
      expect(frameworkChallengesRepository.update).to.have.been.calledOnceWith(challenges);
    });
  });

  describe('when framework has more challenges than active calibrated ones', function () {
    it('calibrates only the matching framework challenges', async function () {
      // given
      const calibrationId = 1;
      const versionId = 123;

      const challenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec1234',
          discriminant: null,
          difficulty: null,
        }),
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec3456',
          discriminant: null,
          difficulty: null,
        }),
      ];

      const activeCalibratedChallenges = [
        domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
          scope: version.scope,
          challengeId: challenges[1].challengeId,
          discriminant: 1.4,
          difficulty: 2.2,
        }),
      ];

      versionRepository.getById.withArgs({ id: versionId }).resolves(version);

      frameworkChallengesRepository.getByVersionId.withArgs({ versionId }).resolves(challenges);

      activeCalibratedChallengeRepository.getByScopeAndCalibrationId
        .withArgs({
          scope: version.scope,
          calibrationId,
        })
        .resolves(activeCalibratedChallenges);

      // when
      await calibrateFrameworkVersion({
        versionId,
        calibrationId,
        frameworkChallengesRepository,
        activeCalibratedChallengeRepository,
        versionRepository,
      });

      // then
      expect(frameworkChallengesRepository.update).to.have.been.calledOnceWith(challenges);
    });
  });

  describe('when active calibrated has more challenges than framework ones', function () {
    it('should return an error', async function () {
      // given
      const calibrationId = 1;
      const versionId = 123;

      const challenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec1234',
          discriminant: null,
          difficulty: null,
        }),
      ];

      const activeCalibratedChallenges = [
        domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
          scope: version.scope,
          challengeId: challenges[0].challengeId,
          discriminant: 1.4,
          difficulty: 2.2,
        }),
        domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
          scope: version.scope,
        }),
      ];

      versionRepository.getById.withArgs({ id: versionId }).resolves(version);

      frameworkChallengesRepository.getByVersionId.withArgs({ versionId }).resolves(challenges);

      activeCalibratedChallengeRepository.getByScopeAndCalibrationId
        .withArgs({
          scope: version.scope,
          calibrationId,
        })
        .resolves(activeCalibratedChallenges);

      // when
      const error = await catchErr(calibrateFrameworkVersion)({
        versionId,
        calibrationId,
        frameworkChallengesRepository,
        activeCalibratedChallengeRepository,
        versionRepository,
      });

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal('The challenge rec123 does not exist in the framework challenges');
    });
  });
});
