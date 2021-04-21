const { databaseBuilder, expect, domainBuilder } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');
const PixPlusDroitMaitreCertificationResult = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const PixPlusDroitExpertCertificationResult = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const juryCertificationSummaryRepository = require('../../../../lib/infrastructure/repositories/jury-certification-summary-repository');

describe('Integration | Repository | JuryCertificationSummary', function() {

  describe('#findBySessionId', () => {

    context('when the session has no certifications', () => {
      let sessionId;

      beforeEach(() => {
        sessionId = databaseBuilder.factory.buildSession().id;

        return databaseBuilder.commit();
      });

      it('should return an empty array', async () => {
        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        expect(juryCertificationSummaries).to.have.length(0);
      });

    });

    context('when the session has some certifications', () => {
      let sessionId;
      let manyAsrCertification;
      let latestAssessmentResult;
      let startedCertification;
      let otherStartedCertification;
      const description = 'Super candidat !';
      let certificationIssueReport;

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        sessionId = dbf.buildSession().id;
        manyAsrCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'AAA' });
        startedCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'CCC' });
        otherStartedCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'DDD' });

        const manyAsrAssessmentId = dbf.buildAssessment({ certificationCourseId: manyAsrCertification.id }).id;
        dbf.buildAssessment({ certificationCourseId: startedCertification.id });

        certificationIssueReport = dbf.buildCertificationIssueReport({
          certificationCourseId: manyAsrCertification.id,
          category: CertificationIssueReportCategories.OTHER,
          description,
        });

        dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-02-15T00:00:00Z') });
        dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-03-15T00:00:00Z') });
        latestAssessmentResult = dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-04-15T00:00:00Z'), status: assessmentResultStatuses.VALIDATED });

        return databaseBuilder.commit();
      });

      it('should return an array of JuryCertificationSummary sorted by name', async () => {
        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        const expectedPixPlusDroitMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        const expectedPixPlusDroitExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
        const expectedJuryCertificationSummary = new JuryCertificationSummary({
          cleaCertificationResult: expectedCleaCertificationResult,
          pixPlusDroitMaitreCertificationResult: expectedPixPlusDroitMaitreCertificationResult,
          pixPlusDroitExpertCertificationResult: expectedPixPlusDroitExpertCertificationResult,
          completedAt: manyAsrCertification.completedAt,
          createdAt: manyAsrCertification.createdAt,
          firstName: manyAsrCertification.firstName,
          hasSeenEndTestScreen: manyAsrCertification.hasSeenEndTestScreen,
          id: manyAsrCertification.id,
          isPublished: manyAsrCertification.isPublished,
          lastName: 'AAA',
          pixScore: latestAssessmentResult.pixScore,
          status: latestAssessmentResult.status,
          certificationIssueReports: [new CertificationIssueReport({
            id: certificationIssueReport.id,
            certificationCourseId: manyAsrCertification.id,
            description,
            subcategory: null,
            questionNumber: null,
            category: CertificationIssueReportCategories.OTHER,
          })],
        });
        expect(juryCertificationSummaries).to.have.length(3);
        expect(juryCertificationSummaries[0]).to.be.instanceOf(JuryCertificationSummary);
        expect(juryCertificationSummaries[0]).to.deep.equal(expectedJuryCertificationSummary);
        expect(juryCertificationSummaries[1].id).to.equal(startedCertification.id);
      });

      context('when the certification has assessment-results', () => {

        it('should return JuryCertificationSummary based on their latest assessment result', async () => {
          // when
          const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

          // then
          expect(juryCertificationSummaries[0].pixScore).to.equal(latestAssessmentResult.pixScore);
          expect(juryCertificationSummaries[0].status).to.equal(JuryCertificationSummary.statuses.VALIDATED);
          expect(juryCertificationSummaries[0].firstName).to.equal(manyAsrCertification.firstName);
          expect(juryCertificationSummaries[0].lastName).to.equal(manyAsrCertification.lastName);
          expect(juryCertificationSummaries[0].createdAt).to.deep.equal(manyAsrCertification.createdAt);
          expect(juryCertificationSummaries[0].completedAt).to.deep.equal(manyAsrCertification.completedAt);
          expect(juryCertificationSummaries[0].isPublished).to.equal(manyAsrCertification.isPublished);
          expect(juryCertificationSummaries[0].hasSeendEndTestScreen).to.equal(manyAsrCertification.hasSeendEndTestScreen);
        });
      });

      context('when the certification has no assessment-result', () => {

        it('should return all juryCertificationSummaries with status started', async () => {
          // when
          const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

          // then
          expect(juryCertificationSummaries[1].id).to.equal(startedCertification.id);
          expect(juryCertificationSummaries[1].status).to.equal(JuryCertificationSummary.statuses.STARTED);

          expect(juryCertificationSummaries[2].id).to.equal(otherStartedCertification.id);
          expect(juryCertificationSummaries[2].status).to.equal(JuryCertificationSummary.statuses.STARTED);
        });
      });

    });

    context('when a summary has several issue reports', () => {
      it('should return all issue reports', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const manyAsrCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'AAA' });

        const manyAsrAssessmentId = dbf.buildAssessment({ certificationCourseId: manyAsrCertification.id }).id;

        const issueReport1 = dbf.buildCertificationIssueReport({
          certificationCourseId: manyAsrCertification.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'first certification issue report',
        });
        const issueReport2 = dbf.buildCertificationIssueReport({
          certificationCourseId: manyAsrCertification.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'second certification issue report',
        });

        dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-04-15T00:00:00Z'), status: assessmentResultStatuses.VALIDATED });

        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);
        const certificationIssueReports = juryCertificationSummaries[0].certificationIssueReports;

        // then
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(certificationIssueReports).to.have.lengthOf(2);
        expect(certificationIssueReports).to.deep.equal([
          new CertificationIssueReport({
            id: issueReport1.id,
            category: issueReport1.category,
            certificationCourseId: manyAsrCertification.id,
            description: 'first certification issue report',
            subcategory: null,
            questionNumber: null,
          }),
          new CertificationIssueReport({
            id: issueReport2.id,
            category: issueReport2.category,
            certificationCourseId: manyAsrCertification.id,
            description: 'second certification issue report',
            subcategory: null,
            questionNumber: null,
          }),
        ]);
      });
    });

    context('when a summary has a Clea certification', () => {

      it('should have the status acquired when clea certification is acquired', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: CleaCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].cleaCertificationResult).to.deep.equal(expectedCleaCertificationResult);
      });

      it('should have the status rejected when clea certification is rejected', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: CleaCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].cleaCertificationResult).to.deep.equal(expectedCleaCertificationResult);
      });
    });

    context('when a summary has a no Clea certification', () => {

      it('should have the status notTaken when clea certification has not be taken', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        dbf.buildCertificationCourse({ sessionId });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].cleaCertificationResult).to.deep.equal(expectedCleaCertificationResult);
      });
    });

    context('when a summary has a Pix plus droit maitre certification', () => {

      it('should have the status acquired when Pix plus droit maitre certification is acquired', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: PixPlusDroitMaitreCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitMaitreCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });

      it('should have the status rejected when Pix plus droit maitre certification is rejected', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: PixPlusDroitMaitreCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitMaitreCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when a summary has a no Pix plus droit maitre certification', () => {

      it('should have the status notTaken when pix plus droit maitre certification has not be taken', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        dbf.buildCertificationCourse({ sessionId });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitMaitreCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when a summary has a Pix plus droit expert certification', () => {

      it('should have the status acquired when Pix plus droit expert certification is acquired', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: PixPlusDroitExpertCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitExpertCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });

      it('should have the status rejected when Pix plus droit expert certification is rejected', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: PixPlusDroitExpertCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey, acquired: false });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitExpertCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when a summary has a no Pix plus droit expert certification', () => {

      it('should have the status notTaken when pix plus droit expert certification has not be taken', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        dbf.buildCertificationCourse({ sessionId });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedPixPlusCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].pixPlusDroitExpertCertificationResult).to.deep.equal(expectedPixPlusCertificationResult);
      });
    });

    context('when a summary has several partner certifications', () => {

      it('should return only one exemplary of the summary with appropriate info on partner certification', async () => {
        // given
        const dbf = databaseBuilder.factory;
        const sessionId = dbf.buildSession().id;
        const certificationCourseId = dbf.buildCertificationCourse({ sessionId }).id;
        dbf.buildBadge({ key: CleaCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey, acquired: true });
        dbf.buildBadge({ key: PixPlusDroitMaitreCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitMaitreCertificationResult.badgeKey, acquired: false });
        dbf.buildBadge({ key: PixPlusDroitExpertCertificationResult.badgeKey });
        dbf.buildPartnerCertification({ certificationCourseId, partnerKey: PixPlusDroitExpertCertificationResult.badgeKey, acquired: true });
        await databaseBuilder.commit();

        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        const expectedCleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
        const expectedPixPlusMaitreCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();
        const expectedPixPlusExpertCertificationResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();
        expect(juryCertificationSummaries).to.have.lengthOf(1);
        expect(juryCertificationSummaries[0].cleaCertificationResult).to.deep.equal(expectedCleaCertificationResult);
        expect(juryCertificationSummaries[0].pixPlusDroitMaitreCertificationResult).to.deep.equal(expectedPixPlusMaitreCertificationResult);
        expect(juryCertificationSummaries[0].pixPlusDroitExpertCertificationResult).to.deep.equal(expectedPixPlusExpertCertificationResult);
      });
    });
  });
});
