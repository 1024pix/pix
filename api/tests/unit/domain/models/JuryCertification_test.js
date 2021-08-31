const { expect, domainBuilder } = require('../../../test-helper');
const JuryCertification = require('../../../../lib/domain/models/JuryCertification');
const GeneralCertificationInformation = require('../../../../lib/domain/read-models/GeneralCertificationInformation');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Unit | Domain | Models | JuryCertification', function() {

  describe('#from', function() {

    it('should return an instance of JuryCertification', function() {
      // given
      const generalCertificationInformation = domainBuilder.buildGeneralCertificationInformation({
        certificationCourseId: 123,
        sessionId: 1000,
        createdAt: new Date('2020-01-30T12:00:00Z'),
        completedAt: new Date('2020-01-30T13:30:00Z'),
        isPublished: false,
        isCancelled: false,
        firstName: 'Lili',
        lastName: 'Delamarche',
        birthdate: new Date('1999-01-01T10:00:00Z'),
        birthplace: 'Paris',
        sex: 'F',
        birthCountry: 'CUBA',
        birthINSEECode: '99407',
        userId: 574,
        certificationIssueReports: [],
      });
      const assessmentResult = new AssessmentResult({
        id: 11,
        assessmentId: 124,
        status: 'validated',
        commentForCandidate: null,
        commentForOrganization: null,
        commentForJury: null,
        createdAt: new Date('2020-01-01T10:00:00Z'),
        emitter: 'PIX_ALGO',
        juryId: 1,
        pixScore: 555,
        competenceMarks: [],
      });
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const juryCertification = JuryCertification.from({
        generalCertificationInformation,
        assessmentResult,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });

      // then
      const expectedJuryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 1000,
        createdAt: new Date('2020-01-30T12:00:00Z'),
        completedAt: new Date('2020-01-30T13:30:00Z'),
        isPublished: false,
        firstName: 'Lili',
        lastName: 'Delamarche',
        birthdate: new Date('1999-01-01T10:00:00Z'),
        birthplace: 'Paris',
        sex: 'F',
        birthCountry: 'CUBA',
        birthINSEECode: '99407',
        birthPostalCode: null,
        userId: 574,
        certificationIssueReports: [],
        status: assessmentResult.status,
        assessmentId: assessmentResult.assessmentId,
        commentForCandidate: assessmentResult.commentForCandidate,
        commentForOrganization: assessmentResult.commentForOrganization,
        commentForJury: assessmentResult.commentForJury,
        juryId: assessmentResult.juryId,
        pixScore: assessmentResult.pixScore,
        competenceMarks: assessmentResult.competenceMarks,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });
      expect(juryCertification).to.deepEqualInstance(expectedJuryCertification);
    });

    describe('when certification course is cancelled', function() {

      it('should return JuryCertification with status cancelled', function() {
        // given
        const generalCertificationInformation = new GeneralCertificationInformation({
          certificationCourseId: 123,
          sessionId: 1000,
          createdAt: new Date('2020-01-30T12:00:00Z'),
          completedAt: new Date('2020-01-30T13:30:00Z'),
          isPublished: false,
          isCancelled: true,
          firstName: 'Lili',
          lastName: 'Delamarche',
          birthdate: new Date('1999-01-01T10:00:00Z'),
          birthplace: 'Paris',
          certificationIssueReports: [],
        });
        const assessmentResult = new AssessmentResult({
          id: 11,
          assessmentId: 124,
          status: 'validated',
          commentForCandidate: null,
          commentForOrganization: null,
          commentForJury: null,
          createdAt: new Date('2020-01-01T10:00:00Z'),
          emitter: 'PIX_ALGO',
          juryId: 1,
          pixScore: 555,
          competenceMarks: [],
        });
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

        // when
        const juryCertification = JuryCertification.from({
          generalCertificationInformation,
          assessmentResult,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(juryCertification).to.be.instanceOf(JuryCertification);
        expect(juryCertification.status).to.equal('cancelled');
      });
    });
  });
});
