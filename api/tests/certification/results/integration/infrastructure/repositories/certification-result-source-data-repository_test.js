import { expect } from 'chai';

import * as certificationResultSourceDataRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-result-source-data-repository.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

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
      let sessionId;
      let expectedCoreV3Data, expectedCleaV3Data, expectedEduV2Data;

      beforeEach(function () {
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: 'Centre certification le meilleur',
        }).id;
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          certificationCenter: 'Nom du centre au moment de la session',
          publishedAt: new Date('2026-01-03'),
        }).id;
        const versionId = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          challengesConfiguration: {},
          status: 'active',
          maxReachableLevel: 7,
        }).id;
        const cleaComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          key: 'CLEA',
        }).id;
        const cleaComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: cleaComplementaryCertificationId,
        }).id;
        const eduComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          key: 'EDU_1ER_DEGRE',
        }).id;
        const eduComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: eduComplementaryCertificationId,
        }).id;

        expectedCoreV3Data = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          certificationCenterId,
          withOrgaLearner: true,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          versionId,
        });
        expectedCleaV3Data = buildCertificateData({
          framework: Frameworks.CLEA,
          sessionId,
          certificationCenterId,
          withOrgaLearner: true,
          versionId,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          complementaryCertificationId: cleaComplementaryCertificationId,
          complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
        });
        expectedEduV2Data = buildCertificateData({
          framework: Frameworks.EDU_1ER_DEGRE,
          sessionId,
          certificationCenterId,
          withOrgaLearner: false,
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          complementaryCertificationId: eduComplementaryCertificationId,
          complementaryCertificationBadgeId: eduComplementaryCertificationBadgeId,
        });
        // NOISE
        const anotherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: 'Centre certification le pire',
        }).id;
        const anotherSessionId = databaseBuilder.factory.buildSession({
          certificationCenterId: anotherCertificationCenterId,
          publishedAt: new Date('2026-01-03'),
        }).id;
        buildCertificateData({
          framework: Frameworks.CORE,
          sessionId: anotherSessionId,
          certificationCenterId: anotherCertificationCenterId,
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
});

function buildCertificateData({
  framework,
  sessionId,
  withOrgaLearner,
  algorithmEngineVersion,
  versionId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
}) {
  const isClea = framework === Frameworks.CLEA;
  const isEdu = framework === Frameworks.EDU_1ER_DEGRE;
  const isCoreScope = [Frameworks.CLEA, Frameworks.CORE].includes(framework);
  const expectedCertifData = {
    sessionId,
    algorithmEngineVersion,
    firstName: `Buffy_${framework}`,
    lastName: `Summers_${framework}`,
    externalId: `externalID_${framework}`,
    birthdate: '1981-01-18',
    birthplace: `Sunnydale_${framework}`,
    birthPostalCode: `birthPostalCode_${framework}`,
    birthINSEECode: `birthINSEECode_${framework}`,
    birthCountry: `birthCountry_${framework}`,
    certificationCenter: 'Nom du centre au moment de la session',
    startedAt: new Date('2026-01-01'),
    deliveredAt: new Date('2026-01-03'),
    status: 'validated',
    framework,
    commentByAutoJury: `commentByAutoJury_${framework}`,
    commentByJury: `commentByJury_${framework}`,
    commentForOrganization: `commentForOrganization_${framework}`,
    commentForCandidate: `commentForCandidate_${framework}`,
  };
  expectedCertifData.maxReachableLevel = isCoreScope ? 7 : null;
  let expectedLearnerData = null;

  const userId = databaseBuilder.factory.buildUser().id;
  expectedCertifData.userId = userId;
  expectedCertifData.verificationCode = `CODEVERIF_${userId}`;

  let organizationLearnerId = null;
  if (withOrgaLearner) {
    expectedLearnerData = {};
    expectedLearnerData.middleName = `Ann_${framework}`;
    expectedLearnerData.thirdName = `Joan_${framework}`;
    expectedLearnerData.nationalStudentId = `xXSlayerXx_${framework}`;
    organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
      middleName: expectedLearnerData.middleName,
      thirdName: expectedLearnerData.thirdName,
      nationalStudentId: expectedLearnerData.nationalStudentId,
    }).id;
    expectedLearnerData.organizationLearnerId = organizationLearnerId;
  }
  expectedCertifData.organizationLearnerId = organizationLearnerId;

  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    organizationLearnerId,
    sessionId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    userId,
    candidateId,
    versionId,
    framework,
    sessionId,
    isPublished: true,
    version: expectedCertifData.algorithmEngineVersion,
    firstName: expectedCertifData.firstName,
    lastName: expectedCertifData.lastName,
    externalId: expectedCertifData.externalId,
    birthdate: expectedCertifData.birthdate,
    birthplace: expectedCertifData.birthplace,
    birthPostalCode: expectedCertifData.birthPostalCode,
    birthINSEECode: expectedCertifData.birthINSEECode,
    birthCountry: expectedCertifData.birthCountry,
    verificationCode: expectedCertifData.verificationCode,
    createdAt: expectedCertifData.startedAt,
  }).id;
  expectedCertifData.certificationCourseId = certificationCourseId;

  if (isClea || isEdu) {
    const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId,
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      complementaryCertificationKey: isClea ? 'CLEA' : 'EDU_1ER_DEGRE',
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId,
      acquired: true,
      source: ComplementaryCertificationCourseResult.sources.PIX,
    });
    if (isEdu) {
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        acquired: false,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
    }
  }
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
  expectedCertifData.status = 'validated';
  expectedCertifData.pixScore = isCoreScope ? 678 : null;
  expectedCertifData.reachedMeshIndex = 3;
  expectedCertifData.commentByAutoJury = `commentByAutoJury_${framework}`;
  expectedCertifData.commentByJury = `commentByJury_${framework}`;
  expectedCertifData.commentForOrganization = `commentForOrganization_${framework}`;
  expectedCertifData.commentForCandidate = `commentForCandidate_${framework}`;
  expectedCertifData.v3EduExternalJuryResult = framework === Frameworks.EDU_CPE ? 'APPROVED' : null;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    assessmentId,
    pixScore: expectedCertifData.pixScore,
    status: expectedCertifData.status,
    reachedMeshIndex: expectedCertifData.reachedMeshIndex,
    commentByAutoJury: expectedCertifData.commentByAutoJury,
    commentByJury: expectedCertifData.commentByJury,
    commentForOrganization: expectedCertifData.commentForOrganization,
    commentForCandidate: expectedCertifData.commentForCandidate,
    v3EduExternalJuryResult: expectedCertifData.v3EduExternalJuryResult,
  }).id;
  expectedCertifData.competenceMarks = [];
  if (algorithmEngineVersion === AlgorithmEngineVersion.V2 || isCoreScope) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
      competenceId: `competenceABC123_${framework}`,
      level: 1,
    });
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
      competenceId: `competenceDEF456_${framework}`,
      level: 7,
    });
    expectedCertifData.competenceMarks = [
      { competenceId: `competenceABC123_${framework}`, level: 1 },
      { competenceId: `competenceDEF456_${framework}`, level: 7 },
    ];
  }

  let expectedCleaData = null;
  let expectedPixPlusV2VoletPixData = null;
  let expectedPixPlusV2VoletExterneData = null;
  if (isClea) {
    expectedCleaData = {
      certificationCourseId,
      cleaBadgeId: complementaryCertificationBadgeId,
      hasAcquiredClea: true,
    };
  }
  if (isEdu) {
    expectedPixPlusV2VoletPixData = {
      certificationCourseId,
      v2ComplementaryVoletPixBadgeId: complementaryCertificationBadgeId,
      v2ComplementaryVoletPixAcquired: true,
    };
    expectedPixPlusV2VoletExterneData = {
      certificationCourseId,
      v2EduVoletExterneBadgeId: complementaryCertificationBadgeId,
      v2EduVoletExterneAcquired: false,
    };
  }
  return {
    certificationData: expectedCertifData,
    learnerData: expectedLearnerData,
    cleaData: expectedCleaData,
    pixPlusV2VoletPixData: expectedPixPlusV2VoletPixData,
    pixPlusV2VoletExterneData: expectedPixPlusV2VoletExterneData,
  };
}
