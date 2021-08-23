const Assessment = require('../../../../lib/domain/models/Assessment');
const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationResult', function() {

  context('#constructor', function() {
    const assessmentId = 123, assessmentResultId = 456, sessionId = 789;
    const competenceMarks = [], certificationIssueReports = [];

    beforeEach(function() {
      competenceMarks.push(domainBuilder.buildCompetenceMark());
      certificationIssueReports.push(domainBuilder.buildCertificationIssueReport());
    });

    it('should construct a certification result with assessementResult data', function() {
      // given
      const expectedCertificationResult = {
        id: '123',
        lastName: 'Wayne',
        firstName: 'Malik',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        completedAt: new Date('2020-05-05'),
        createdAt: new Date('2020-01-01'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: { status: 'not_taken' },
        pixPlusDroitMaitreCertificationResult: { status: 'not_taken' },
        pixPlusDroitExpertCertificationResult: { status: 'not_taken' },
        certificationIssueReports,
        hasSeenEndTestScreen: true,
        assessmentId,
        sessionId,
        resultCreatedAt: new Date('2018-01-12T01:02:03Z'),
        pixScore: 31,
        status: 'validated',
        emitter: 'PIX-ALGO',
        commentForCandidate: 'Comment for Candidate',
        commentForJury: 'Comment for Jury',
        commentForOrganization: 'Comment for Organization',
        competencesWithMark: competenceMarks,
        juryId: 1,
      };

      // when
      const certificationResult = new CertificationResult({
        id: '123',
        lastAssessmentResult: domainBuilder.buildAssessmentResult({
          id: assessmentResultId,
          competenceMarks,
        }),
        certificationIssueReports,
        firstName: 'Malik',
        lastName: 'Wayne',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-05-05'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        hasSeenEndTestScreen: true,
        sessionId,
        assessmentId,
      });

      // then
      expect(certificationResult).to.deep.equal(expectedCertificationResult);

    });

    it('should construct a certification result without assessementResult data', function() {
      // given
      const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
      const expectedCertificationResult = {
        id: '123',
        lastName: 'Wayne',
        firstName: 'Malik',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        completedAt: new Date('2020-05-05'),
        createdAt: new Date('2020-01-01'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: { status: 'not_taken' },
        pixPlusDroitMaitreCertificationResult: { status: 'not_taken' },
        pixPlusDroitExpertCertificationResult: { status: 'not_taken' },
        certificationIssueReports,
        hasSeenEndTestScreen: true,
        sessionId,
        assessmentId,
        resultCreatedAt: undefined,
        pixScore: undefined,
        status: Assessment.states.STARTED,
        emitter: undefined,
        commentForCandidate: undefined,
        commentForJury: undefined,
        commentForOrganization: undefined,
        competencesWithMark: [],
        juryId: undefined,
      };

      // when
      const certificationResult = new CertificationResult({
        id: '123',
        lastAssessmentResult: undefined,
        certificationIssueReports,
        firstName: 'Malik',
        lastName: 'Wayne',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-05-05'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        hasSeenEndTestScreen: true,
        assessmentId,
        sessionId,
      });

      // then
      expect(certificationResult).to.deep.equal(expectedCertificationResult);

    });

    it('should construct a certification result with a cancelled status', function() {
      // given
      const certificationIssueReports = [Symbol('a')];
      const expectedCertificationResult = {
        id: '123',
        lastName: 'Wayne',
        firstName: 'Malik',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        completedAt: new Date('2020-05-05'),
        createdAt: new Date('2020-01-01'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: { status: 'not_taken' },
        pixPlusDroitMaitreCertificationResult: { status: 'not_taken' },
        pixPlusDroitExpertCertificationResult: { status: 'not_taken' },
        certificationIssueReports,
        hasSeenEndTestScreen: true,
        sessionId,
        assessmentId,
        resultCreatedAt: undefined,
        pixScore: undefined,
        status: CertificationResult.status.CANCELLED,
        emitter: undefined,
        commentForCandidate: undefined,
        commentForJury: undefined,
        commentForOrganization: undefined,
        competencesWithMark: [],
        juryId: undefined,
      };

      // when
      const certificationResult = new CertificationResult({
        id: '123',
        lastAssessmentResult: undefined,
        certificationIssueReports,
        firstName: 'Malik',
        lastName: 'Wayne',
        birthplace: 'Perpignan',
        birthdate: '2000-08-30',
        externalId: 'externalId',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-05-05'),
        isPublished: true,
        isV2Certification: true,
        cleaCertificationResult: domainBuilder.buildCleaCertificationResult.notTaken(),
        pixPlusDroitMaitreCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
        pixPlusDroitExpertCertificationResult: domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
        hasSeenEndTestScreen: true,
        assessmentId,
        sessionId,
        isCourseCancelled: true,
      });

      // then
      expect(certificationResult).to.deep.equal(expectedCertificationResult);
    });
  });

  context('#static from', function() {
    let certificationResultData;

    beforeEach(function() {
      certificationResultData = {
        id: 123,
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
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
        commentForOrganization: 'Un commentaire orga 1',
        juryId: 159,
        competenceMarksJson: '[{ "id":123, "score":10, "level":4, "area_code":2, "competence_code":2.3, "assessmentResultId":753, "competenceId":"recComp23"}]',
      };
    });

    it('should build a CertificationResult from various arguments', function() {
      // given
      const certificationResultDTO = {
        ...certificationResultData,
        isCancelled: false,
        assessmentResultStatus: CertificationResult.status.VALIDATED,
      };
      const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const certificationResult = CertificationResult.from({
        certificationResultDTO,
        certificationIssueReports,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
      });

      // then
      const expectedCertificationResult = domainBuilder.buildCertificationResult2({
        id: 123,
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
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        emitter: 'Moi',
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
        commentForOrganization: 'Un commentaire orga 1',
        juryId: 159,
        cleaCertificationResult,
        pixPlusDroitMaitreCertificationResult,
        pixPlusDroitExpertCertificationResult,
        certificationIssueReports,
        competencesWithMark: [domainBuilder.buildCompetenceMark({
          id: 123,
          level: 4,
          score: 10,
          area_code: '2',
          competence_code: '2.3',
          competenceId: 'recComp23',
          assessmentResultId: 753,
        })],
      });
      expect(certificationResult).to.deepEqualInstance(expectedCertificationResult);
    });

    context('status', function() {

      it('should build a cancelled CertificationResult when certification is cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: true,
          assessmentResultStatus: CertificationResult.status.VALIDATED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.CANCELLED);
      });

      it('should build a validated CertificationResult when assessmentResultStatus is validated and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.VALIDATED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.VALIDATED);
      });

      it('should build a rejected CertificationResult when assessmentResultStatus is rejected and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.REJECTED,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.REJECTED);
      });

      it('should build an error CertificationResult when assessmentResultStatus is in error and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: CertificationResult.status.ERROR,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.ERROR);
      });

      it('should build a started CertificationResult when there are no assessmentResultStatus and certification not cancelled', function() {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          isCancelled: false,
          assessmentResultStatus: null,
        };
        const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
          certificationIssueReports,
          cleaCertificationResult,
          pixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult,
        });

        // then
        expect(certificationResult.status).to.equal(CertificationResult.status.STARTED);
      });
    });
  });

  context('#isCancelled', function() {
    it('returns true if status is "cancelled"', function() {
      // given
      const cancelledCertificationResult = new CertificationResult({
        isCourseCancelled: true,
      });

      // when / then
      expect(cancelledCertificationResult.isCancelled()).to.be.true;
    });
  });

  context('#hasTakenClea', function() {

    it('returns true when Clea certification has been taken in the certification', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.true;
    });

    it('returns false when Clea certification has not been taken in the certification', async function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitMaitre', function() {

    it('returns true when Pix plus maitre certification has been taken in the certification', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been taken in the certification', async function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitExpert', function() {

    it('returns true when Pix plus droit expert certification has been taken in the certification', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been taken in the certification', async function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.false;
    });
  });
});
