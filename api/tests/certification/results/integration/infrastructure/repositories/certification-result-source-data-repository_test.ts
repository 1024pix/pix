import { expect } from 'chai';

import * as certificationResultSourceDataRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-result-source-data-repository.ts';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import type { Framework } from '../../../../../../src/certification/shared/domain/types.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';

type LooseBuilder = ((attributes?: Record<string, unknown>) => { id: number }) & {
  last: (attributes?: Record<string, unknown>) => { id: number };
};
// The JSDoc of the JS database builders is inferred from their default values (e.g. publishedAt: null),
// too narrow to be used from TS without fixing every builder.
const factory = databaseBuilder.factory as unknown as Record<string, LooseBuilder>;

describe('Certification | Results | Integration | Infrastructure | Repository | CertificationResultSourceData', function () {
  describe('#findBySessionId', function () {
    context('when no data found for session', function () {
      it('returns empty source data', async function () {
        const sourceData = await certificationResultSourceDataRepository.findBySessionId(123);

        expect(sourceData).to.deep.equal({
          certificationData: [],
          learnerData: [],
          cleaData: [],
          pixPlusV2VoletPixData: [],
          pixPlusV2VoletExterneData: [],
        });
      });
    });

    context('when data found for session', function () {
      let sessionId: number;
      let expectedCoreV3Data: ExpectedData, expectedCleaV3Data: ExpectedData, expectedEduV2Data: ExpectedData;

      beforeEach(function () {
        const certificationCenterId = factory.buildCertificationCenter({
          name: 'Centre certification le meilleur',
        }).id;
        sessionId = factory.buildSession({
          certificationCenterId,
          certificationCenter: 'Nom du centre au moment de la session',
          publishedAt: new Date('2026-01-03'),
        }).id;
        const versionId = factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          challengesConfiguration: {},
          status: 'active',
          maxReachableLevel: 7,
        }).id;
        const cleaComplementaryCertificationId = factory.buildComplementaryCertification({
          key: 'CLEA',
        }).id;
        const cleaComplementaryCertificationBadgeId = factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: cleaComplementaryCertificationId,
        }).id;
        const eduComplementaryCertificationId = factory.buildComplementaryCertification({
          key: 'EDU_1ER_DEGRE',
        }).id;
        const eduComplementaryCertificationBadgeId = factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: eduComplementaryCertificationId,
        }).id;

        expectedCoreV3Data = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          versionId,
        });
        expectedCleaV3Data = buildCertificateData({
          framework: Frameworks.CLEA,
          sessionId,
          withOrgaLearner: true,
          versionId,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          complementaryCertificationId: cleaComplementaryCertificationId,
          complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
        });
        expectedEduV2Data = buildCertificateData({
          framework: Frameworks.EDU_1ER_DEGRE,
          sessionId,
          withOrgaLearner: false,
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          complementaryCertificationId: eduComplementaryCertificationId,
          complementaryCertificationBadgeId: eduComplementaryCertificationBadgeId,
        });
        // NOISE
        const anotherCertificationCenterId = factory.buildCertificationCenter({
          name: 'Centre certification le pire',
        }).id;
        const anotherSessionId = factory.buildSession({
          certificationCenterId: anotherCertificationCenterId,
          publishedAt: new Date('2026-01-03'),
        }).id;
        buildCertificateData({
          framework: Frameworks.CORE,
          sessionId: anotherSessionId,
          withOrgaLearner: true,
        });
        return databaseBuilder.commit();
      });

      it('returns all source data from the certifications of the given session', async function () {
        const sourceData = await certificationResultSourceDataRepository.findBySessionId(sessionId);

        const expectedAllCertificationData = [expectedCoreV3Data, expectedCleaV3Data, expectedEduV2Data].map(
          ({ certificationData }) => certificationData,
        );
        const expectedAllLearnerData = [expectedCoreV3Data, expectedCleaV3Data].map(({ learnerData }) => learnerData);
        expect(sourceData).to.deep.equal({
          certificationData: expectedAllCertificationData,
          learnerData: expectedAllLearnerData,
          cleaData: [expectedCleaV3Data.cleaData],
          pixPlusV2VoletPixData: [expectedEduV2Data.pixPlusV2VoletPixData],
          pixPlusV2VoletExterneData: [expectedEduV2Data.pixPlusV2VoletExterneData],
        });
      });
    });
  });

  describe('#findByCertificationCourseIds', function () {
    context('when given an empty list', function () {
      it('returns empty source data', async function () {
        const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds([]);

        expect(sourceData).to.deep.equal({
          certificationData: [],
          learnerData: [],
          cleaData: [],
          pixPlusV2VoletPixData: [],
          pixPlusV2VoletExterneData: [],
        });
      });
    });

    context('when no data found for given certification course ids', function () {
      it('returns empty source data', async function () {
        const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds([123, 456]);

        expect(sourceData).to.deep.equal({
          certificationData: [],
          learnerData: [],
          cleaData: [],
          pixPlusV2VoletPixData: [],
          pixPlusV2VoletExterneData: [],
        });
      });
    });

    context('when data found for given certification course ids', function () {
      let expectedCoreV3Data: ExpectedData,
        expectedCleaV3Data: ExpectedData,
        expectedEduV2Data: ExpectedData,
        expectedEduV3Data: ExpectedData,
        unpublishedData: ExpectedData;

      beforeEach(function () {
        const sessionId = factory.buildSession({
          certificationCenterId: null,
          certificationCenter: 'Nom du centre au moment de la session',
          publishedAt: new Date('2026-01-03'),
        }).id;
        const anotherSessionId = factory.buildSession({
          certificationCenterId: null,
          certificationCenter: 'Nom du centre au moment de la session',
          publishedAt: new Date('2026-01-03'),
        }).id;
        const versionId = factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          challengesConfiguration: {},
          status: 'active',
          maxReachableLevel: 7,
        }).id;
        const cleaComplementaryCertificationId = factory.buildComplementaryCertification({
          key: 'CLEA',
        }).id;
        const cleaComplementaryCertificationBadgeId = factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: cleaComplementaryCertificationId,
        }).id;
        const eduComplementaryCertificationId = factory.buildComplementaryCertification({
          key: 'EDU_1ER_DEGRE',
        }).id;
        const eduComplementaryCertificationBadgeId = factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: eduComplementaryCertificationId,
        }).id;

        expectedCoreV3Data = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          versionId,
        });
        expectedCleaV3Data = buildCertificateData({
          framework: Frameworks.CLEA,
          sessionId: anotherSessionId,
          withOrgaLearner: true,
          versionId,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          complementaryCertificationId: cleaComplementaryCertificationId,
          complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
        });
        expectedEduV2Data = buildCertificateData({
          framework: Frameworks.EDU_1ER_DEGRE,
          sessionId: anotherSessionId,
          withOrgaLearner: false,
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          complementaryCertificationId: eduComplementaryCertificationId,
          complementaryCertificationBadgeId: eduComplementaryCertificationBadgeId,
        });
        expectedEduV3Data = buildCertificateData({
          framework: Frameworks.EDU_CPE,
          sessionId,
          withOrgaLearner: false,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
        });
        unpublishedData = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          versionId,
          isPublished: false,
        });
        // NOISE
        buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          versionId,
        });
        return databaseBuilder.commit();
      });

      it('returns all source data from the given published certifications', async function () {
        const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds([
          expectedEduV2Data.certificationData.certificationCourseId,
          expectedCoreV3Data.certificationData.certificationCourseId,
          unpublishedData.certificationData.certificationCourseId,
          expectedEduV3Data.certificationData.certificationCourseId,
          expectedCleaV3Data.certificationData.certificationCourseId,
        ]);

        const expectedAllCertificationData = [
          expectedCoreV3Data,
          expectedCleaV3Data,
          expectedEduV2Data,
          expectedEduV3Data,
        ].map(({ certificationData }) => certificationData);
        const expectedAllLearnerData = [expectedCoreV3Data, expectedCleaV3Data].map(({ learnerData }) => learnerData);
        expect(sourceData).to.deep.equal({
          certificationData: expectedAllCertificationData,
          learnerData: expectedAllLearnerData,
          cleaData: [expectedCleaV3Data.cleaData],
          pixPlusV2VoletPixData: [expectedEduV2Data.pixPlusV2VoletPixData],
          pixPlusV2VoletExterneData: [expectedEduV2Data.pixPlusV2VoletExterneData],
        });
      });
    });

    context('when the user has been anonymised', function () {
      it('returns certification data without userId', async function () {
        // given
        const sessionId = factory.buildSession({ publishedAt: new Date('2026-01-03') }).id;
        const anonymisedUserData = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: false,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          hasUserBeenAnonymised: true,
        });
        await databaseBuilder.commit();

        // when
        const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds([
          anonymisedUserData.certificationData.certificationCourseId,
        ]);

        // then
        expect(sourceData.certificationData).to.have.lengthOf(1);
        expect(sourceData.certificationData[0].userId).to.equal(null);
      });
    });

    context('when the organization learner has been deleted', function () {
      it('returns certification data without organizationLearnerId and no learner data', async function () {
        // given
        const sessionId = factory.buildSession({ publishedAt: new Date('2026-01-03') }).id;
        const deletedLearnerData = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          hasLearnerBeenDeleted: true,
        });
        await databaseBuilder.commit();

        // when
        const sourceData = await certificationResultSourceDataRepository.findByCertificationCourseIds([
          deletedLearnerData.certificationData.certificationCourseId,
        ]);

        // then
        expect(sourceData.certificationData).to.have.lengthOf(1);
        expect(sourceData.certificationData[0].organizationLearnerId).to.equal(null);
        expect(sourceData.learnerData).to.deep.equal([]);
      });
    });
  });
});

type ExpectedData = ReturnType<typeof buildCertificateData>;

function buildCertificateData({
  framework,
  sessionId,
  withOrgaLearner,
  isPublished = true,
  algorithmEngineVersion,
  versionId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
  hasUserBeenAnonymised = false,
  hasLearnerBeenDeleted = false,
}: {
  framework: Framework;
  sessionId: number;
  withOrgaLearner: boolean;
  isPublished?: boolean;
  algorithmEngineVersion?: number;
  versionId?: number;
  complementaryCertificationId?: number;
  complementaryCertificationBadgeId?: number;
  hasUserBeenAnonymised?: boolean;
  hasLearnerBeenDeleted?: boolean;
}) {
  const isClea = framework === Frameworks.CLEA;
  const isEdu = framework === Frameworks.EDU_1ER_DEGRE;
  const isCoreScope = isClea || framework === Frameworks.CORE;

  const userId = factory.buildUser({ hasBeenAnonymised: hasUserBeenAnonymised }).id;

  let expectedLearnerData = null;
  if (withOrgaLearner) {
    const learnerAttributes = {
      middleName: `Ann_${framework}`,
      thirdName: `Joan_${framework}`,
      nationalStudentId: `xXSlayerXx_${framework}`,
    };
    const organizationLearnerId = factory.buildOrganizationLearner({
      ...learnerAttributes,
      deletedAt: hasLearnerBeenDeleted ? new Date('2026-02-01') : null,
    }).id;
    expectedLearnerData = { organizationLearnerId, ...learnerAttributes };
  }
  const organizationLearnerId = expectedLearnerData?.organizationLearnerId ?? null;

  const candidateId = factory.buildCertificationCandidate({
    organizationLearnerId,
    sessionId,
  }).id;
  const certificationCourseAttributes = {
    firstName: `Buffy_${framework}`,
    lastName: `Summers_${framework}`,
    externalId: `externalID_${framework}`,
    birthdate: '1981-01-18',
    birthplace: `Sunnydale_${framework}`,
    birthPostalCode: `birthPostalCode_${framework}`,
    birthINSEECode: `birthINSEECode_${framework}`,
    birthCountry: `birthCountry_${framework}`,
    verificationCode: `CODEVERIF_${userId}`,
  };
  const startedAt = new Date('2026-01-01');
  const certificationCourseId = factory.buildCertificationCourse({
    userId,
    candidateId,
    versionId,
    framework,
    sessionId,
    isPublished,
    version: algorithmEngineVersion,
    createdAt: startedAt,
    ...certificationCourseAttributes,
  }).id;

  if (isClea || isEdu) {
    const complementaryCertificationCourseId = factory.buildComplementaryCertificationCourse({
      certificationCourseId,
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      complementaryCertificationKey: isClea ? 'CLEA' : 'EDU_1ER_DEGRE',
    }).id;
    factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      acquired: true,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });
    if (isEdu) {
      factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        acquired: false,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
    }
  }

  const assessmentId = factory.buildAssessment({ certificationCourseId }).id;
  const assessmentResultAttributes = {
    status: 'validated',
    pixScore: isCoreScope ? 678 : null,
    reachedMeshIndex: 3,
    commentByAutoJury: `commentByAutoJury_${framework}`,
    commentByJury: `commentByJury_${framework}`,
    commentForOrganization: `commentForOrganization_${framework}`,
    commentForCandidate: `commentForCandidate_${framework}`,
  };
  const v3EduExternalJuryResult = framework === Frameworks.EDU_CPE ? 'APPROVED' : null;
  const assessmentResultId = factory.buildAssessmentResult.last({
    certificationCourseId,
    assessmentId,
    eduV3ExternalJuryResult: v3EduExternalJuryResult,
    ...assessmentResultAttributes,
  }).id;

  let competenceMarks: Array<{ competenceId: string; level: number }> = [];
  if (algorithmEngineVersion === AlgorithmEngineVersion.V2 || isCoreScope) {
    competenceMarks = [
      { competenceId: `competenceABC123_${framework}`, level: 1 },
      { competenceId: `competenceDEF456_${framework}`, level: 7 },
    ];
    for (const competenceMark of competenceMarks) {
      factory.buildCompetenceMark({ assessmentResultId, ...competenceMark });
    }
  }

  const expectedCertificationData = {
    certificationCourseId,
    userId,
    sessionId,
    organizationLearnerId,
    algorithmEngineVersion,
    ...certificationCourseAttributes,
    certificationCenter: 'Nom du centre au moment de la session',
    startedAt,
    deliveredAt: new Date('2026-01-03'),
    framework,
    maxReachableLevel: isCoreScope ? 7 : null,
    ...assessmentResultAttributes,
    v3EduExternalJuryResult,
    competenceMarks,
  };

  return {
    certificationData: expectedCertificationData,
    learnerData: expectedLearnerData,
    cleaData: isClea
      ? {
          certificationCourseId,
          cleaBadgeId: complementaryCertificationBadgeId,
          hasAcquiredClea: true,
        }
      : null,
    pixPlusV2VoletPixData: isEdu
      ? {
          certificationCourseId,
          v2ComplementaryVoletPixBadgeId: complementaryCertificationBadgeId,
          v2ComplementaryVoletPixAcquired: true,
        }
      : null,
    pixPlusV2VoletExterneData: isEdu
      ? {
          certificationCourseId,
          v2EduVoletExterneBadgeId: complementaryCertificationBadgeId,
          v2EduVoletExterneAcquired: false,
        }
      : null,
  };
}
