const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationResult', function() {

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
      const expectedCertificationResult = domainBuilder.buildCertificationResult({
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

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        // eslint-disable-next-line mocha/no-setup-in-describe
        { statusName: 'cancelled', isCancelled: true, assessmentResultStatus: CertificationResult.status.VALIDATED, validationFunction: 'isCancelled' },
        // eslint-disable-next-line mocha/no-setup-in-describe
        { statusName: 'validated', isCancelled: false, assessmentResultStatus: CertificationResult.status.VALIDATED, validationFunction: 'isValidated' },
        // eslint-disable-next-line mocha/no-setup-in-describe
        { statusName: 'rejected', isCancelled: false, assessmentResultStatus: CertificationResult.status.REJECTED, validationFunction: 'isRejected' },
        // eslint-disable-next-line mocha/no-setup-in-describe
        { statusName: 'error', isCancelled: false, assessmentResultStatus: CertificationResult.status.ERROR, validationFunction: 'isInError' },
        // eslint-disable-next-line mocha/no-setup-in-describe
        { statusName: 'started', isCancelled: false, assessmentResultStatus: null, validationFunction: 'isStarted' },
      ].forEach(function(testCase) {
        it(`should build a ${testCase.statusName} CertificationResult`, function() {
          // given
          const certificationResultDTO = {
            ...certificationResultData,
            isCancelled: testCase.isCancelled,
            assessmentResultStatus: testCase.assessmentResultStatus,
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
          expect(certificationResult[testCase.validationFunction]()).to.be.true;
        });
      });
    });
  });

  context('#isCancelled', function() {

    it('returns true if status is "cancelled"', function() {
      // given
      const cancelledCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.CANCELLED,
      });

      // when / then
      expect(cancelledCertificationResult.isCancelled()).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
    ].forEach(function(testCase) {
      it(`should return false when status is ${testCase.statusName}`, function() {
        // given
        const notCancelledCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isCancelled = notCancelledCertificationResult.isCancelled();

        // then
        expect(isCancelled).to.be.false;
      });
    });
  });

  context('#isValidated', function() {

    it('returns true if status is "validated"', function() {
      // given
      const validatedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.VALIDATED,
      });

      // when
      const isValidated = validatedCertificationResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
    ].forEach(function(testCase) {
      it(`should return false when status is ${testCase.statusName}`, function() {
        // given
        const notValidatedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isValidated = notValidatedCertificationResult.isValidated();

        // then
        expect(isValidated).to.be.false;
      });
    });
  });

  context('#isRejected', function() {

    it('returns true if status is "rejected"', function() {
      // given
      const rejectedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.REJECTED,
      });

      // when
      const isRejected = rejectedCertificationResult.isRejected();

      // then
      expect(isRejected).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
    ].forEach(function(testCase) {
      it(`should return false when status is ${testCase.statusName}`, function() {
        // given
        const notRejectedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isRejected = notRejectedCertificationResult.isRejected();

        // then
        expect(isRejected).to.be.false;
      });
    });
  });

  context('#isInError', function() {

    it('returns true if status is "error"', function() {
      // given
      const errorCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.ERROR,
      });

      // when
      const isInError = errorCertificationResult.isInError();

      // then
      expect(isInError).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
    ].forEach(function(testCase) {
      it(`should return false when status is ${testCase.statusName}`, function() {
        // given
        const notInErrorCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isInError = notInErrorCertificationResult.isInError();

        // then
        expect(isInError).to.be.false;
      });
    });
  });

  context('#isStarted', function() {

    it('returns true if status is "started"', function() {
      // given
      const startedCertificationResult = domainBuilder.buildCertificationResult({
        status: CertificationResult.status.STARTED,
      });

      // when
      const isStarted = startedCertificationResult.isStarted();

      // then
      expect(isStarted).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
    ].forEach(function(testCase) {
      it(`should return false when status is ${testCase.statusName}`, function() {
        // given
        const notStartedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isStarted = notStartedCertificationResult.isStarted();

        // then
        expect(isStarted).to.be.false;
      });
    });
  });

  context('#hasTakenClea', function() {

    it('returns true when Clea certification has been taken in the certification', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.true;
    });

    it('returns false when Clea certification has not been taken in the certification', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.false;
    });
  });

  context('#hasAcquiredClea', function() {

    it('returns true when Clea certification has been acquired', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasAcquiredClea = certificationResult.hasAcquiredClea();

      // then
      expect(hasAcquiredClea).to.be.true;
    });

    it('returns false when Clea certification has not been acquired', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasAcquiredClea = certificationResult.hasAcquiredClea();

      // then
      expect(hasAcquiredClea).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitMaitre', function() {

    it('returns true when Pix plus maitre certification has been taken in the certification', function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been taken in the certification', function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasAcquiredPixPlusDroitMaitre', function() {

    it('returns true when Pix plus maitre certification has been acquired', function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasAcquiredPixPlusDroitMaitre = certificationResult.hasAcquiredPixPlusDroitMaitre();

      // then
      expect(hasAcquiredPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been acquired', function() {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasAcquiredPixPlusDroitMaitre = certificationResult.hasAcquiredPixPlusDroitMaitre();

      // then
      expect(hasAcquiredPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitExpert', function() {

    it('returns true when Pix plus droit expert certification has been taken in the certification', function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been taken in the certification', function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.false;
    });
  });

  context('#hasAcquiredPixPlusDroitExpert', function() {

    it('returns true when Pix plus droit expert certification has been acquired', function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasAcquiredPixPlusDroitExpert = certificationResult.hasAcquiredPixPlusDroitExpert();

      // then
      expect(hasAcquiredPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been acquired', function() {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasAcquiredPixPlusDroitExpert = certificationResult.hasAcquiredPixPlusDroitExpert();

      // then
      expect(hasAcquiredPixPlusDroitExpert).to.be.false;
    });
  });
});
