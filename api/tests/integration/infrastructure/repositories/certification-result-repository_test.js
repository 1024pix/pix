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
      const juryId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isCancelled: false,
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId,
      }).id;
      const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        isV2Certification: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        completedAt: new Date('2021-06-07'),
        hasSeenEndTestScreen: true,
        sessionId,
      }).id;
      const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        isPublished: false,
        isCancelled: true,
        isV2Certification: true,
        externalId: 'WITCH',
        createdAt: new Date('2020-10-10'),
        completedAt: new Date('2020-10-11'),
        hasSeenEndTestScreen: false,
        sessionId,
      }).id;
      const assessmentId1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId1,
      }).id;
      const assessmentId2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId2,
      }).id;
      const assessmentId3 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId3,
      }).id;
      const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId1,
        createdAt: new Date('2000-01-01'),
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
        commentForOrganization: 'Un commentaire orga 1',
        juryId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId2,
        createdAt: new Date('2001-01-01'),
        pixScore: 0,
        status: CertificationResult.status.REJECTED,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 2',
        commentForJury: 'Un commentaire jury 2',
        commentForOrganization: 'Un commentaire orga 2',
        juryId,
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
      const expectedFirstCertificationResult = domainBuilder.buildCertificationResult2({
        id: certificationCourseId2,
        firstName: 'Rupert',
        lastName: 'Giles',
        birthdate: '1964-03-15',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isV2Certification: false,
        externalId: 'RIPPER',
        createdAt: new Date('2021-06-06'),
        completedAt: new Date('2021-06-07'),
        hasSeenEndTestScreen: true,
        sessionId,
        assessmentId: assessmentId2,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        certificationIssueReports: [],
        status: CertificationResult.status.REJECTED,
        resultCreatedAt: new Date('2001-01-01'),
        pixScore: 0,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 2',
        commentForJury: 'Un commentaire jury 2',
        commentForOrganization: 'Un commentaire orga 2',
        competencesWithMark: [],
        juryId,
      });
      const expectedSecondCertificationResult = domainBuilder.buildCertificationResult2({
        id: certificationCourseId3,
        firstName: 'Auffy',
        lastName: 'Summers',
        birthdate: '1981-01-01',
        birthplace: 'Salem',
        externalId: 'WITCH',
        isPublished: false,
        isV2Certification: true,
        createdAt: new Date('2020-10-10'),
        completedAt: new Date('2020-10-11'),
        hasSeenEndTestScreen: false,
        sessionId,
        assessmentId: assessmentId3,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        certificationIssueReports: [],
        status: CertificationResult.status.CANCELLED,
        resultCreatedAt: null,
        pixScore: null,
        emitter: null,
        commentForCandidate: null,
        commentForJury: null,
        commentForOrganization: null,
        competencesWithMark: [],
        juryId: null,
      });
      const expectedThirdCertificationResult = domainBuilder.buildCertificationResult2({
        id: certificationCourseId1,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId,
        assessmentId: assessmentId1,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        certificationIssueReports: [],
        status: CertificationResult.status.VALIDATED,
        resultCreatedAt: new Date('2000-01-01'),
        pixScore: 123,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
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
        juryId,
      });
      expect(certificationResults).to.deepEqualArray([expectedFirstCertificationResult, expectedSecondCertificationResult, expectedThirdCertificationResult]);
    });

    it('should get the clea certification result if clea V1 taken', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = await _buildCertificationResult(sessionId);
      databaseBuilder.factory.buildBadge({ key: cleaBadgeKeyV1 });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: cleaBadgeKeyV1, acquired: true });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0].cleaCertificationResult).to.deepEqualInstance(expectedCleaCertificationResult);
    });

    it('should get the clea certification result if clea V2 taken', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = await _buildCertificationResult(sessionId);
      databaseBuilder.factory.buildBadge({ key: cleaBadgeKeyV2 });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: cleaBadgeKeyV2, acquired: true });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0].cleaCertificationResult).to.deepEqualInstance(expectedCleaCertificationResult);
    });

    it('should get the pix plus droit maitre certification result if taken', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = await _buildCertificationResult(sessionId);
      databaseBuilder.factory.buildBadge({ key: pixPlusDroitMaitreBadgeKey });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: pixPlusDroitMaitreBadgeKey, acquired: false });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedPixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0].pixPlusDroitMaitreCertificationResult).to.deepEqualInstance(expectedPixPlusDroitMaitreCertificationResult);
    });

    it('should get the pix plus droit expert certification result if taken', async function() {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = await _buildCertificationResult(sessionId);
      databaseBuilder.factory.buildBadge({ key: pixPlusDroitExpertBadgeKey });
      databaseBuilder.factory.buildPartnerCertification({ certificationCourseId, partnerKey: pixPlusDroitExpertBadgeKey, acquired: true });
      await databaseBuilder.commit();

      // when
      const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

      // then
      const expectedPixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      expect(certificationResults).to.have.length(1);
      expect(certificationResults[0].pixPlusDroitExpertCertificationResult).to.deepEqualInstance(expectedPixPlusDroitExpertCertificationResult);
    });
  });
});

async function _buildCertificationResult(sessionId) {
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
