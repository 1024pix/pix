const { databaseBuilder, expect } = require('../../../test-helper');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
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

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        sessionId = dbf.buildSession().id;
        manyAsrCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'AAA' });
        startedCertification = dbf.buildCertificationCourse({ sessionId, lastName: 'CCC' });

        const manyAsrAssessmentId = dbf.buildAssessment({ certificationCourseId: manyAsrCertification.id }).id;
        dbf.buildAssessment({ certificationCourseId: startedCertification.id });

        dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-02-15T00:00:00Z') });
        dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-03-15T00:00:00Z') });
        latestAssessmentResult = dbf.buildAssessmentResult({ assessmentId: manyAsrAssessmentId, createdAt: new Date('2018-04-15T00:00:00Z'), status: assessmentResultStatuses.VALIDATED });

        return databaseBuilder.commit();
      });

      it('should return an array of JuryCertificationSummary sorted by name', async () => {
        // when
        const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

        // then
        expect(juryCertificationSummaries).to.have.length(2);
        expect(juryCertificationSummaries[0]).to.be.instanceOf(JuryCertificationSummary);
        expect(juryCertificationSummaries[0].id).to.equal(manyAsrCertification.id);
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
          expect(juryCertificationSummaries[0].examinerComment).to.equal(manyAsrCertification.examinerComment);
          expect(juryCertificationSummaries[0].hasSeendEndTestScreen).to.equal(manyAsrCertification.hasSeendEndTestScreen);
        });
      });

      context('when the certification has no assessment-result', () => {

        it('should return JuryCertificationSummary with status started', async () => {
          // when
          const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

          // then
          expect(juryCertificationSummaries[1].status).to.equal(JuryCertificationSummary.statuses.STARTED);
          expect(juryCertificationSummaries[1].pixScore).to.be.null;
          expect(juryCertificationSummaries[1].firstName).to.equal(startedCertification.firstName);
          expect(juryCertificationSummaries[1].lastName).to.equal(startedCertification.lastName);
          expect(juryCertificationSummaries[1].createdAt).to.deep.equal(startedCertification.createdAt);
          expect(juryCertificationSummaries[1].completedAt).to.deep.equal(startedCertification.completedAt);
          expect(juryCertificationSummaries[1].isPublished).to.equal(startedCertification.isPublished);
          expect(juryCertificationSummaries[1].examinerComment).to.equal(startedCertification.examinerComment);
          expect(juryCertificationSummaries[1].hasSeendEndTestScreen).to.equal(startedCertification.hasSeendEndTestScreen);
        });
      });

    });
  });
});
