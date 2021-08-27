const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationResultRepository = require('../../../../lib/infrastructure/repositories/certification-result-repository');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { badgeKeyV1: cleaBadgeKeyV1, badgeKeyV2: cleaBadgeKeyV2 } = require('../../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Integration | Infrastructure | Repository | Certification Result', function() {

  describe('#findBySessionId', function() {

    it('should return all certification results in a session ordered by lastName, firstName', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
      }).id;
      const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
      }).id;
      const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        isPublished: false,
        isCancelled: true,
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
      }).id;
      const certificationCourseIdNotInSession = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId1,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId2,
      }).id;
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId3,
      });
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseIdNotInSession,
      });
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        pixScore: 0,
        status: CertificationResult.status.REJECTED,
        commentForOrganization: 'Un commentaire orga 2',
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId: assessmentResultId1,
      });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedFirstCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId2,
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.REJECTED,
        pixScore: 0,
        commentForOrganization: 'Un commentaire orga 2',
        competencesWithMark: [],
      });
      const expectedSecondCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId3,
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        externalId: 'WITCH',
        isPublished: false,
        createdAt: new Date('2020-10-10'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.CANCELLED,
        pixScore: null,
        commentForOrganization: null,
        competencesWithMark: [],
      });
      const expectedThirdCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId1,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.VALIDATED,
        pixScore: 123,
        commentForOrganization: 'Un commentaire orga 1',
        competencesWithMark: [domainBuilder.buildCompetenceMark({
          id: 123,
          score: 10,
          level: 4,
          competence_code: '2.3',
          area_code: '2',
          competenceId: 'recComp23',
          assessmentResultId: assessmentResultId1,
        })],
      });
      expect(certificationResults).to.deepEqualArray([expectedFirstCertificationResult, expectedSecondCertificationResult, expectedThirdCertificationResult]);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { complementaryCertificationName: 'CléA V1', badgeKey: cleaBadgeKeyV1, validationFunction: 'hasAcquiredClea' },
      { complementaryCertificationName: 'CléA V2', badgeKey: cleaBadgeKeyV2, validationFunction: 'hasAcquiredClea' },
      { complementaryCertificationName: 'PixPlus Droit Maître', badgeKey: pixPlusDroitMaitreBadgeKey, validationFunction: 'hasAcquiredPixPlusDroitMaitre' },
      { complementaryCertificationName: 'PixPlus Droit Expert', badgeKey: pixPlusDroitExpertBadgeKey, validationFunction: 'hasAcquiredPixPlusDroitExpert' },
    ].forEach(function(testCase) {
      it(`should get the ${testCase.complementaryCertificationName} result if this complementary certification was taken`, async function() {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId = await _buildCertificationResultInSession(sessionId);
        databaseBuilder.factory.buildBadge({ key: testCase.badgeKey });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: testCase.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

        // then
        expect(certificationResults).to.have.length(1);
        expect(certificationResults[0][testCase.validationFunction]()).to.be.true;
      });
    });
  });

  describe('#findByCertificationCandidateIds', function() {

    it('should return all certification results linked to given certificationCandidateIds ordered by lastName, firstName', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      const userId3 = databaseBuilder.factory.buildUser().id;
      const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        userId: userId1,
      }).id;
      const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        userId: userId2,
      }).id;
      const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        isPublished: false,
        isCancelled: true,
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        sessionId,
        userId: userId3,
      }).id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId1,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId2,
      }).id;
      databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId3,
      });
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        commentForOrganization: 'Un commentaire orga 1',
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        pixScore: 0,
        status: CertificationResult.status.REJECTED,
        commentForOrganization: 'Un commentaire orga 2',
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId: assessmentResultId1,
      });
      const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({ userId: userId1, sessionId }).id;
      const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({ userId: userId2, sessionId }).id;
      const certificationCandidateId3 = databaseBuilder.factory.buildCertificationCandidate({ userId: userId3, sessionId }).id;
      const certificationCandidateIdNotInSession = databaseBuilder.factory.buildCertificationCandidate({ userId: userId3 }).id;
      const certificationCandidateIdNoResult = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
        certificationCandidateIds: [certificationCandidateId1, certificationCandidateId2, certificationCandidateId3, certificationCandidateIdNotInSession, certificationCandidateIdNoResult],
      });

      // then
      const expectedFirstCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId2,
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.REJECTED,
        pixScore: 0,
        commentForOrganization: 'Un commentaire orga 2',
        competencesWithMark: [],
      });
      const expectedSecondCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId3,
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        externalId: 'WITCH',
        isPublished: false,
        createdAt: new Date('2020-10-10'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.CANCELLED,
        pixScore: null,
        commentForOrganization: null,
        competencesWithMark: [],
      });
      const expectedThirdCertificationResult = domainBuilder.buildCertificationResult({
        id: certificationCourseId1,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        sessionId,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        status: CertificationResult.status.VALIDATED,
        pixScore: 123,
        commentForOrganization: 'Un commentaire orga 1',
        competencesWithMark: [domainBuilder.buildCompetenceMark({
          id: 123,
          score: 10,
          level: 4,
          competence_code: '2.3',
          area_code: '2',
          competenceId: 'recComp23',
          assessmentResultId: assessmentResultId1,
        })],
      });
      expect(certificationResults).to.deepEqualArray([expectedFirstCertificationResult, expectedSecondCertificationResult, expectedThirdCertificationResult]);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { complementaryCertificationName: 'CléA V1', badgeKey: cleaBadgeKeyV1, validationFunction: 'hasAcquiredClea' },
      { complementaryCertificationName: 'CléA V2', badgeKey: cleaBadgeKeyV2, validationFunction: 'hasAcquiredClea' },
      { complementaryCertificationName: 'PixPlus Droit Maître', badgeKey: pixPlusDroitMaitreBadgeKey, validationFunction: 'hasAcquiredPixPlusDroitMaitre' },
      { complementaryCertificationName: 'PixPlus Droit Expert', badgeKey: pixPlusDroitExpertBadgeKey, validationFunction: 'hasAcquiredPixPlusDroitExpert' },
    ].forEach(function(testCase) {
      it(`should get the ${testCase.complementaryCertificationName} result if this complementary certification was taken`, async function() {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const { certificationCandidateId, certificationCourseId } = await _buildCertificationResultWithCandidate(sessionId);
        databaseBuilder.factory.buildBadge({ key: testCase.badgeKey });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: testCase.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({ certificationCandidateIds: [certificationCandidateId] });

        // then
        expect(certificationResults).to.have.length(1);
        expect(certificationResults[0][testCase.validationFunction]()).to.be.true;
      });
    });
  });
});

async function _buildCertificationResultInSession(sessionId) {
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  await databaseBuilder.commit();
  return certificationCourseId;
}

async function _buildCertificationResultWithCandidate() {
  const sessionId = databaseBuilder.factory.buildSession().id;
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId,
    userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
  }).id;
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
  }).id;
  await databaseBuilder.commit();
  return { certificationCourseId, certificationCandidateId };
}
