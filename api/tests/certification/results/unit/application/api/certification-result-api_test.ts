import type { UUID } from 'node:crypto';

import { expect } from 'chai';
import sinon, { type SinonSpy, type SinonStub } from 'sinon';

import * as certificationResultApi from '../../../../../../src/certification/results/application/api/certification-result-api.ts';
import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../src/certification/results/domain/constants.ts';
import type {
  CertificationDataProps,
  CertificationResultSourceData,
} from '../../../../../../src/certification/results/domain/models/factories/CertificationResultSourceData.ts';
import {
  CertificationResult,
  UserCertificationResult,
} from '../../../../../../src/certification/results/domain/models/NewCertificationResult.ts';
import { usecases } from '../../../../../../src/certification/results/domain/usecases/index.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Unit | application | api | certif results', function () {
  describe('#buildForSession', function () {
    let sessionId: number;
    let newCertificationResultRepository: {
      save: SinonStub<
        [{ certificationResults: CertificationResult[]; userCertificationResults: UserCertificationResult[] }],
        Promise<void>
      >;
    };
    let certificationResultSourceDataRepository: { findBySessionId: SinonStub };
    let uuidGenerator: () => UUID;
    let featureToggles: { get: SinonStub };
    let logErrorSpy: SinonSpy;
    let dependencies: {
      newCertificationResultRepository: typeof newCertificationResultRepository;
      certificationResultSourceDataRepository: typeof certificationResultSourceDataRepository;
      featureToggles: typeof featureToggles;
      uuidGenerator: typeof uuidGenerator;
    };
    let validCertificationItem: CertificationDataProps;
    let brokenCertificationItem: CertificationDataProps;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda: () => unknown) => lambda());
      sessionId = 7402;
      uuidGenerator = () => '00000000-0000-4000-8000-000000000001';
      newCertificationResultRepository = {
        save: sinon.stub(),
      };
      certificationResultSourceDataRepository = {
        findBySessionId: sinon.stub(),
      };
      featureToggles = { get: sinon.stub() };
      preventStubsToBeCalledUnexpectedly([
        newCertificationResultRepository.save,
        certificationResultSourceDataRepository.findBySessionId,
        featureToggles.get,
      ]);
      newCertificationResultRepository.save.resolves();
      sinon.useFakeTimers({ now: new Date('2024-11-23'), toFake: ['Date'] });
      dependencies = {
        newCertificationResultRepository,
        certificationResultSourceDataRepository,
        featureToggles,
        uuidGenerator,
      };
      logErrorSpy = sinon.spy(logger, 'error');
      validCertificationItem = buildCertificationItem({ certificationCourseId: 1, userId: 11, sessionId });
      brokenCertificationItem = {
        ...buildCertificationItem({ certificationCourseId: 2, userId: 22, sessionId }),
        // @ts-expect-error: broken on purpose, so that the factory rejects it
        pixScore: undefined,
      };
    });

    context('when FT writeNewCertificationResults is disabled', function () {
      it('does nothing', async function () {
        featureToggles.get.withArgs('writeNewCertificationResults').resolves(false);

        await certificationResultApi.buildForSession({
          sessionId,
          dependencies,
        });

        sinon.assert.notCalled(newCertificationResultRepository.save);
      });
    });

    context('when FT writeNewCertificationResults is enabled', function () {
      beforeEach(function () {
        featureToggles.get.withArgs('writeNewCertificationResults').resolves(true);
      });

      context('when some errors occur when building the certification results', function () {
        it('logs the errors but save the successful built ones anyway', async function () {
          certificationResultSourceDataRepository.findBySessionId
            .withArgs(sessionId)
            .resolves(buildSourceData([validCertificationItem, brokenCertificationItem]));

          await certificationResultApi.buildForSession({
            sessionId,
            dependencies,
          });

          expect(logErrorSpy).to.have.been.calledOnceWith(
            sinon.match('Errors encountered when generating certification results: {"2":'),
          );
          sinon.assert.calledOnce(newCertificationResultRepository.save);
          const [{ certificationResults, userCertificationResults }] =
            newCertificationResultRepository.save.firstCall.args;
          expect(certificationResults).to.have.lengthOf(1);
          expect(certificationResults[0]).to.be.instanceOf(CertificationResult);
          expect(userCertificationResults).to.deep.equal([
            new UserCertificationResult({
              certificationCourseId: 1,
              userId: 11,
              sessionId,
              organizationLearnerId: null,
              certificationResultId: '00000000-0000-4000-8000-000000000001',
            }),
          ]);
        });
      });

      context('when no error occurs when building the certification results', function () {
        it('logs nothing and save the successful built ones anyway', async function () {
          certificationResultSourceDataRepository.findBySessionId
            .withArgs(sessionId)
            .resolves(buildSourceData([validCertificationItem]));

          await certificationResultApi.buildForSession({
            sessionId,
            dependencies,
          });

          sinon.assert.notCalled(logErrorSpy);
          sinon.assert.calledOnce(newCertificationResultRepository.save);
          const [{ certificationResults, userCertificationResults }] =
            newCertificationResultRepository.save.firstCall.args;
          expect(certificationResults).to.have.lengthOf(1);
          expect(certificationResults[0]).to.be.instanceOf(CertificationResult);
          expect(userCertificationResults).to.deep.equal([
            new UserCertificationResult({
              certificationCourseId: 1,
              userId: 11,
              sessionId,
              organizationLearnerId: null,
              certificationResultId: '00000000-0000-4000-8000-000000000001',
            }),
          ]);
        });
      });
    });
  });

  describe('#deleteForSession', function () {
    it('deletes the certification results of the session within a transaction', async function () {
      // given
      const sessionId = 7402;
      const executeStub = sinon.stub(DomainTransaction, 'execute').callsFake((lambda: () => unknown) => lambda());
      const newCertificationResultRepository = {
        deleteBySession: sinon.stub<[number], Promise<void>>().resolves(),
      };

      // when
      await certificationResultApi.deleteForSession({
        sessionId,
        dependencies: { newCertificationResultRepository },
      });

      // then
      sinon.assert.calledOnce(executeStub);
      sinon.assert.calledOnceWithExactly(newCertificationResultRepository.deleteBySession, sessionId);
    });
  });

  describe('#updateEduV3ExternalJuryResult', function () {
    it('calls the usecase with the given parameters', async function () {
      // given
      sinon.stub(usecases, 'updateEduV3ExternalJuryResult').resolves();

      // when
      await certificationResultApi.updateEduV3ExternalJuryResult({
        certificationCourseId: 123,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });

      // then
      expect(usecases.updateEduV3ExternalJuryResult).to.have.been.calledOnceWithExactly({
        certificationCourseId: 123,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });
    });
  });

  describe('#updateEduV2ExternalJuryResult', function () {
    it('calls the usecase with the given parameters', async function () {
      // given
      sinon.stub(usecases, 'updateEduV2ExternalJuryResult').resolves();

      // when
      await certificationResultApi.updateEduV2ExternalJuryResult({
        certificationCourseId: 123,
        v2EduVoletExterneBadgeId: 456,
        v2EduVoletExterneAcquired: true,
      });

      // then
      expect(usecases.updateEduV2ExternalJuryResult).to.have.been.calledOnceWithExactly({
        certificationCourseId: 123,
        v2EduVoletExterneBadgeId: 456,
        v2EduVoletExterneAcquired: true,
      });
    });
  });
});

function buildSourceData(certificationData: CertificationDataProps[]): CertificationResultSourceData {
  return {
    certificationData,
    learnerData: [],
    cleaData: [],
    pixPlusV2VoletPixData: [],
    pixPlusV2VoletExterneData: [],
  };
}

function buildCertificationItem({
  certificationCourseId,
  userId,
  sessionId,
}: {
  certificationCourseId: number;
  userId: number;
  sessionId: number;
}): CertificationDataProps {
  return {
    certificationCourseId,
    userId,
    sessionId,
    organizationLearnerId: null,
    algorithmEngineVersion: AlgorithmEngineVersion.V3,
    firstName: 'Buffy',
    lastName: 'Summers',
    externalId: null,
    birthdate: '1981-01-18',
    birthplace: 'Sunnydale',
    birthPostalCode: null,
    birthINSEECode: null,
    birthCountry: null,
    verificationCode: 'VERIFCODE',
    certificationCenter: 'Centre certification le meilleur',
    startedAt: new Date('2025-12-30'),
    deliveredAt: new Date('2025-12-31'),
    status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
    framework: Frameworks.CORE,
    maxReachableLevel: 7,
    pixScore: 678,
    reachedMeshIndex: 3,
    v3EduExternalJuryResult: null,
    commentByAutoJury: null,
    commentByJury: null,
    commentForOrganization: null,
    commentForCandidate: null,
    competenceMarks: [],
  };
}
