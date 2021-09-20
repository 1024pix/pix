const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertification = require('../../../../lib/domain/models/JuryCertification');

describe('Unit | Domain | Models | JuryCertification', function() {

  describe('#from', function() {
    let juryCertificationBaseDTO;

    beforeEach(function() {
      juryCertificationBaseDTO = {
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        assessmentResultStatus: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentForJury: 'ça va',
        competenceMarks: [{ 'id': 123, 'score': 10, 'level': 4, 'area_code': '2', 'competence_code': '2.3', 'assessmentResultId': 753, 'competenceId': 'recComp23' }],
      };
    });

    it('should return an instance of JuryCertification', function() {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: 555 });
      const juryCertificationDTO = {
        ...juryCertificationBaseDTO,
        isCancelled: false,
      };
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
      const certificationIssueReports = [certificationIssueReport];

      // when
      const juryCertification = JuryCertification.from({
        juryCertificationDTO,
        certificationIssueReports,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });

      // then
      const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
        id: 123,
        level: 4,
        score: 10,
        area_code: '2',
        competence_code: '2.3',
        competenceId: 'recComp23',
        assessmentResultId: 753,
      });
      const expectedJuryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        firstName: 'James',
        lastName: 'Watt',
        birthdate: '1990-01-04',
        birthplace: 'Somewhere',
        sex: 'M',
        birthCountry: 'ENGLAND',
        birthINSEECode: '99124',
        birthPostalCode: null,
        createdAt: new Date('2020-02-20T10:30:00Z'),
        completedAt: new Date('2020-02-20T11:00:00Z'),
        isPublished: true,
        status: 'rejected',
        juryId: 1,
        pixScore: 555,
        commentForCandidate: 'coucou',
        commentForOrganization: 'comment',
        commentForJury: 'ça va',
        competenceMarks: [expectedCompetenceMark],
        certificationIssueReports,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });

    context('status', function() {

      it('should return a cancelled juryCertification regardless of assessment result status if certif is cancelled', function() {
        // given
        const juryCertificationDTO = {
          ...juryCertificationBaseDTO,
          isCancelled: true,
          assessmentResultStatus: 'WHATEVERIWANT',
        };
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

        // when
        const juryCertification = JuryCertification.from({
          juryCertificationDTO,
          certificationIssueReports: [],
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(juryCertification.status).to.equal('cancelled');
      });

      it('should set the status of the juryCertification as the assessmentResultStatus otherwise', function() {
        // given
        const juryCertificationDTO = {
          ...juryCertificationBaseDTO,
          isCancelled: false,
          assessmentResultStatus: 'WHATEVERIWANT',
        };
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

        // when
        const juryCertification = JuryCertification.from({
          juryCertificationDTO,
          certificationIssueReports: [],
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(juryCertification.status).to.equal('WHATEVERIWANT');
      });
    });
  });
});
