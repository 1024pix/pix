const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const juryCertificationRepository = require('../../../../lib/infrastructure/repositories/jury-certification-repository');
const { badgeKeyV1: cleaBadgeKeyV1, badgeKeyV2: cleaBadgeKeyV2 } = require('../../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Integration | Infrastructure | Repository | Jury Certification', function() {

  describe('#get', function() {

    it('should throw a NotFoundError when no JuryCertification exists for given certification course id', async function() {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 1 });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(juryCertificationRepository.get)(2);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certification course of id 2 does not exist.');
    });

    it('should return get the JuryCertification for given certificationCourseId', async function() {
      // given
      databaseBuilder.factory.buildUser({ id: 789 });
      databaseBuilder.factory.buildSession({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({ id: 2, sessionId: 456 });
      databaseBuilder.factory.buildAssessment({ certificationCourseId: 2 });
      databaseBuilder.factory.buildCertificationCourse({
        id: 1,
        sessionId: 456,
        userId: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        sex: 'F',
        birthplace: 'Torreilles',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRONCE',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
        isPublished: false,
        isCancelled: false,
      });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
      databaseBuilder.factory.buildUser({ id: 22 });
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: 159,
        pixScore: 123,
        status: 'validated',
        commentForOrganization: 'Un commentaire orga',
        commentForCandidate: 'Un commentaire candidat',
        commentForJury: 'Un commentaire jury',
        juryId: 22,
      }).id;
      databaseBuilder.factory.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId,
      });
      await databaseBuilder.commit();

      // when
      const juryCertification = await juryCertificationRepository.get(1);

      // then
      const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
        id: 123,
        score: 10,
        level: 4,
        competence_code: '2.3',
        area_code: '2',
        competenceId: 'recComp23',
        assessmentResultId,
      });
      const expectedJuryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 1,
        sessionId: 456,
        userId: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        sex: 'F',
        birthplace: 'Torreilles',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRONCE',
        status: 'validated',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
        isPublished: false,
        juryId: 22,
        pixScore: 123,
        commentForOrganization: 'Un commentaire orga',
        commentForCandidate: 'Un commentaire candidat',
        commentForJury: 'Un commentaire jury',
        competenceMarks: [expectedCompetenceMark],
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        certificationIssueReports: [],
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });

    it('should return along the certificationIssueReports if any ordered by ID', async function() {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 1 });
      databaseBuilder.factory.buildCertificationCourse({ id: 2 });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 1 });
      const expectedCertificationIssueReportA = domainBuilder.buildCertificationIssueReport.impactful({
        id: 456,
        certificationCourseId: 1,
        description: 'une description 1',
        questionNumber: 1,
        resolvedAt: new Date('2022-05-05'),
        resolution: 'super',
      });
      const expectedCertificationIssueReportB = domainBuilder.buildCertificationIssueReport.notImpactful({
        id: 123,
        certificationCourseId: 1,
        description: 'une description 2',
        questionNumber: 12,
        resolvedAt: new Date('2021-12-25'),
        resolution: 'les doigts dans le nez',
      });
      const anotherIssueReport = domainBuilder.buildCertificationIssueReport.notImpactful({
        id: 789,
        certificationCourseId: 2,
      });
      databaseBuilder.factory.buildCertificationIssueReport(expectedCertificationIssueReportA);
      databaseBuilder.factory.buildCertificationIssueReport(expectedCertificationIssueReportB);
      databaseBuilder.factory.buildCertificationIssueReport(anotherIssueReport);
      await databaseBuilder.commit();

      // when
      const juryCertification = await juryCertificationRepository.get(1);

      // then
      expect(juryCertification.certificationIssueReports).to.deepEqualArray([expectedCertificationIssueReportB, expectedCertificationIssueReportA]);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { complementaryCertificationName: 'CléA V1', badgeKey: cleaBadgeKeyV1, complementaryCertificationResult: 'cleaCertificationResult' },
      { complementaryCertificationName: 'CléA V2', badgeKey: cleaBadgeKeyV2, complementaryCertificationResult: 'cleaCertificationResult' },
      { complementaryCertificationName: 'PixPlus Droit Maître', badgeKey: pixPlusDroitMaitreBadgeKey, complementaryCertificationResult: 'pixPlusDroitMaitreCertificationResult' },
      { complementaryCertificationName: 'PixPlus Droit Expert', badgeKey: pixPlusDroitExpertBadgeKey, complementaryCertificationResult: 'pixPlusDroitExpertCertificationResult' },
    ].forEach(function(testCase) {
      it(`should get the ${testCase.complementaryCertificationName} result if this complementary certification was taken`, async function() {
        // given
        await _buildJuryCertification(1);
        databaseBuilder.factory.buildBadge({ key: testCase.badgeKey });
        databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: 1, partnerKey: testCase.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const juryCertification = await juryCertificationRepository.get(1);

        // then
        expect(juryCertification[testCase.complementaryCertificationResult].status).to.equal('acquired');
      });
    });
  });
});

async function _buildJuryCertification(certificationCourseId) {
  databaseBuilder.factory.buildCertificationCourse({ id: certificationCourseId });
  databaseBuilder.factory.buildAssessment({ certificationCourseId: 1 });
  await databaseBuilder.commit();
}
