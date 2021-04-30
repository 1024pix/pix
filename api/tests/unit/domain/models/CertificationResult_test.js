const Assessment = require('../../../../lib/domain/models/Assessment');

const CertificationResult = require('../../../../lib/domain/models/CertificationResult');

const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationResult', () => {

  context('#constructor', () => {
    const assessmentId = domainBuilder.buildAssessment().id;
    const assessmentResultId = domainBuilder.buildAssessmentResult().id;
    const sessionId = domainBuilder.buildSession().id;
    const certificationIssueReports = [domainBuilder.buildCertificationIssueReport()];
    const competenceMarks = [domainBuilder.buildCompetenceMark()];

    it('should construct a certification result with assessementResult data', () => {
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

    it('should construct a certification result without assessementResult data', () => {
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
  });

  context('#hasTakenClea', () => {

    it('returns true when Clea certification has been taken in the certification', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.true;
    });

    it('returns false when Clea certification has not been taken in the certification', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ cleaCertificationResult });

      // when
      const hasTakenClea = certificationResult.hasTakenClea();

      // then
      expect(hasTakenClea).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitMaitre', () => {

    it('returns true when Pix plus maitre certification has been taken in the certification', async () => {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.true;
    });

    it('returns false when Pix plus maitre certification has not been taken in the certification', async () => {
      // given
      const pixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitMaitreCertificationResult });

      // when
      const hasTakenPixPlusDroitMaitre = certificationResult.hasTakenPixPlusDroitMaitre();

      // then
      expect(hasTakenPixPlusDroitMaitre).to.be.false;
    });
  });

  context('#hasTakenPixPlusDroitExpert', () => {

    it('returns true when Pix plus droit expert certification has been taken in the certification', async () => {
      // given
      const pixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
      const certificationResult = domainBuilder.buildCertificationResult({ pixPlusDroitExpertCertificationResult });

      // when
      const hasTakenPixPlusDroitExpert = certificationResult.hasTakenPixPlusDroitExpert();

      // then
      expect(hasTakenPixPlusDroitExpert).to.be.true;
    });

    it('returns false when Pix plus droit expert certification has not been taken in the certification', async () => {
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
