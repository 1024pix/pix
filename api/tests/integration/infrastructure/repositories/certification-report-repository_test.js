const _ = require('lodash');
const { databaseBuilder, domainBuilder, expect, catchErr, knex } = require('../../../test-helper');
const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const certificationReportRepository = require('../../../../lib/infrastructure/repositories/certification-report-repository');
const { CertificationCourseUpdateError } = require('../../../../lib/domain/errors');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Integration | Repository | CertificationReport', function() {

  describe('#findBySessionId', () => {

    context('when there are some certification reports with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification reports with a specific session ID', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Abba', sessionId });
        const certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Xubbu', sessionId });
        const certificationIssueReport1 = databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId: certificationCourse1.id,
          category: CertificationIssueReportCategories.OTHER,
          description: 'Houston, nous avons un problème',
        });
        // In other session
        const anotherSessionId = databaseBuilder.factory.buildSession().id;
        databaseBuilder.factory.buildCertificationCourse({ anotherSessionId });

        await databaseBuilder.commit();

        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        const expectedCertificationReport1 = domainBuilder.buildCertificationReport({
          id: CertificationReport.idFromCertificationCourseId(certificationCourse1.id),
          certificationCourseId: certificationCourse1.id,
          firstName: certificationCourse1.firstName,
          lastName: certificationCourse1.lastName,
          certificationIssueReports: [ { ...certificationIssueReport1, isActionRequired: true } ],
          hasSeenEndTestScreen: certificationCourse1.hasSeenEndTestScreen,
        });
        const expectedCertificationReport2 = domainBuilder.buildCertificationReport({
          id: CertificationReport.idFromCertificationCourseId(certificationCourse2.id),
          certificationCourseId: certificationCourse2.id,
          firstName: certificationCourse2.firstName,
          lastName: certificationCourse2.lastName,
          certificationIssueReports: [],
          hasSeenEndTestScreen: certificationCourse2.hasSeenEndTestScreen,
        });
        expect(certificationReports).to.deep.equal([expectedCertificationReport1, expectedCertificationReport2]);
      });
    });

    context('when there is no certification reports with the given session ID', function() {

      it('should return an empty array', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;

        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        expect(certificationReports).to.deep.equal([]);
      });
    });
  });

  describe('#finalizeAll', () => {
    let sessionId;

    afterEach(() => {
      return knex('certification-issue-reports').delete();
    });

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when reports are being successfully finalized', () => {
      it('should finalize certification reports', async () => {
        const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          hasSeenEndTestScreen: false,
        }).id;

        const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          hasSeenEndTestScreen: false,
        }).id;

        await databaseBuilder.commit();

        // given
        const certificationReport1 = domainBuilder.buildCertificationReport({
          sessionId,
          certificationCourseId: certificationCourseId1,
          hasSeenEndTestScreen: true,
        });

        const certificationReport2 = domainBuilder.buildCertificationReport({
          sessionId,
          certificationCourseId: certificationCourseId2,
          hasSeenEndTestScreen: false,
        });

        // when
        await certificationReportRepository.finalizeAll([certificationReport1, certificationReport2]);

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
        const actualReport1 = _.find(actualCertificationReports, { id: certificationReport1.id });

        expect(actualReport1.hasSeenEndTestScreen).to.equal(true);
      });

    });

    context('when finalization fails', () => {

      it('should have left the Courses as they were and rollback updates if any', async () => {
        // given
        const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          hasSeenEndTestScreen: false,
        }).id;

        const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          hasSeenEndTestScreen: false,
        }).id;

        await databaseBuilder.commit();

        const certificationReport1 = domainBuilder.buildCertificationReport({
          certificationCourseId: certificationCourseId1,
          hasSeenEndTestScreen: false,
          examinerComment: 'J\'aime les fruits et les poulets',
          sessionId,
        });

        const certificationReport2 = domainBuilder.buildCertificationReport({
          certificationCourseId: certificationCourseId2,
          hasSeenEndTestScreen: 'je suis supposé être un booléen',
          examinerComment: null,
          sessionId,
        });

        // when
        const error = await catchErr(certificationReportRepository.finalizeAll, certificationReportRepository)([certificationReport1, certificationReport2]);

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
        const actualReport1 = _.find(actualCertificationReports, { id: certificationReport1.id });
        const actualReport2 = _.find(actualCertificationReports, { id: certificationReport2.id });

        expect(actualReport1.certificationIssueReports).to.deep.equal([]);
        expect(actualReport2.hasSeenEndTestScreen).to.equal(false);
        expect(error).to.be.an.instanceOf(CertificationCourseUpdateError);
      });

    });

  });

});
