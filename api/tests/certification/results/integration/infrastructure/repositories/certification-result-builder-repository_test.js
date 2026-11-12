import { expect } from 'chai';

import { CertificationResultBuilder } from '../../../../../../src/certification/results/domain/models/CertificationResultBuilder.ts';
import * as certificateBuilderRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-result-builder-repository.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Infrastructure | Repository | CertificationResultBuilder', function () {
  describe('#findBuilderForCertificationsInSession', function () {
    context('when no data found for session', function () {
      it('returns an empty builder', async function () {
        const certificateBuilder = await certificateBuilderRepository.findBuilderForCertificationsInSession(123);
        expect(certificateBuilder.certificationData).to.have.lengthOf(0); // TODO PAS FAN
      });
    });

    context('when data found for session', function () {
      let sessionId;
      let expectedCoreData, expectedCleaData, expectedProSanteData, expectedDroitData, expectedEduData;

      beforeEach(function () {
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: 'Centre certification le meilleur',
        }).id;
        sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          publishedAt: new Date('2026-01-03'),
        }).id;
        expectedCoreData = buildCertificateData({
          framework: Frameworks.CORE,
          sessionId,
          certificationCenterId,
          withOrgaLearner: true,
        });
        expectedCleaData = buildCertificateData({
          framework: Frameworks.CLEA,
          sessionId,
          certificationCenterId,
          withOrgaLearner: false,
        });
        expectedProSanteData = buildCertificateData({
          framework: Frameworks.PRO_SANTE,
          sessionId,
          certificationCenterId,
          withOrgaLearner: true,
        });
        expectedDroitData = buildCertificateData({
          framework: Frameworks.DROIT,
          sessionId,
          certificationCenterId,
          withOrgaLearner: false,
        });
        expectedEduData = buildCertificateData({
          framework: Frameworks.EDU_CPE,
          sessionId,
          certificationCenterId,
          withOrgaLearner: true,
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

      it('returns a CertificateBuilder filled with all data from the certifications of the given session', async function () {
        const certificateBuilder = await certificateBuilderRepository.findBuilderForCertificationsInSession(sessionId);
        const expectedAllCertificationData = [
          expectedCoreData,
          expectedCleaData,
          expectedProSanteData,
          expectedDroitData,
          expectedEduData,
        ].map(({ certificationData }) => certificationData);
        const expectedAllLearnerData = [expectedCoreData, expectedProSanteData, expectedEduData].map(
          ({ learnerData }) => learnerData,
        );
        expect(certificateBuilder).to.deepEqualInstance(
          new CertificationResultBuilder({
            certificationData: expectedAllCertificationData,
            learnerData: expectedAllLearnerData,
            cleaData: [expectedCleaData.cleaData],
          }),
        );
      });
    });
  });
});

function buildCertificateData({ framework, sessionId, withOrgaLearner }) {
  const isClea = framework === Frameworks.CLEA;
  const isCoreScope = [Frameworks.CLEA, Frameworks.CORE].includes(framework);
  const expectedCertifData = {
    sessionId,
    algorithmEngineVersion: AlgorithmEngineVersion.V3,
    firstName: `Buffy_${framework}`,
    lastName: `Summers_${framework}`,
    externalId: `externalID_${framework}`,
    birthdate: '1981-01-18',
    birthplace: `Sunnydale_${framework}`,
    birthPostalCode: `birthPostalCode_${framework}`,
    birthINSEECode: `birthINSEECode_${framework}`,
    birthCountry: `birthCountry_${framework}`,
    certificationCenter: 'Centre certification le meilleur',
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

  const versionId = databaseBuilder.factory.buildCertificationVersion({
    scope: isClea ? SCOPES.CORE : framework,
    challengesConfiguration: {},
    status: 'active',
    maxReachableLevel: expectedCertifData.maxReachableLevel,
  }).id;

  let cleaComplementaryCertificationBadgeId, cleaComplementaryCertificationId;
  if (isClea) {
    cleaComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      key: 'CLEA',
    }).id;
    cleaComplementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
      complementaryCertificationId: cleaComplementaryCertificationId,
    }).id;
  }

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

  if (isClea) {
    const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
      certificationCourseId,
      complementaryCertificationId: cleaComplementaryCertificationId,
      complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
      complementaryCertificationKey: 'CLEA',
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
      acquired: true,
    });
  }
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
  expectedCertifData.status = 'validated';
  expectedCertifData.pixScore = isCoreScope ? 678 : null;
  expectedCertifData.reachedMeshIndex = 3;
  expectedCertifData.commentByAutoJury = `commentByAutoJury_${framework}`;
  expectedCertifData.commentByJury = `commentByJury_${framework}`;
  expectedCertifData.commentForOrganization = `commentForOrganization_${framework}`;
  expectedCertifData.commentForCandidate = `commentForCandidate_${framework}`;
  expectedCertifData.eduV3ExternalJuryResult = framework === Frameworks.EDU_CPE ? 'APPROVED' : null;
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
    eduV3ExternalJuryResult: expectedCertifData.eduV3ExternalJuryResult,
  }).id;
  expectedCertifData.competenceMarks = [];
  if (isCoreScope) {
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
  if (isClea) {
    expectedCleaData = {
      certificationCourseId,
      complementaryCertificationBadgeId: cleaComplementaryCertificationBadgeId,
      acquired: true,
    };
  }

  return {
    certificationData: expectedCertifData,
    learnerData: expectedLearnerData,
    cleaData: expectedCleaData,
  };
}
