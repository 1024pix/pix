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
          categoryId: CertificationIssueReportCategories.OTHER,
          description: 'Houston, nous avons un problème',
        });
        // In other session
        const anotherSessionId = databaseBuilder.factory.buildSession().id;
        databaseBuilder.factory.buildCertificationCourse({ anotherSessionId }).id;

        await databaseBuilder.commit();
        
        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        const expectedCertificationReport1 = {
          id: CertificationReport.idFromCertificationCourseId(certificationCourse1.id),
          certificationCourseId: certificationCourse1.id,
          firstName: certificationCourse1.firstName,
          lastName: certificationCourse1.lastName,
          examinerComment: certificationIssueReport1.description,
          certificationIssueReports: [ certificationIssueReport1 ],
          hasSeenEndTestScreen: certificationCourse1.hasSeenEndTestScreen,
        };
        const expectedCertificationReport2 = {
          id: CertificationReport.idFromCertificationCourseId(certificationCourse2.id),
          certificationCourseId: certificationCourse2.id,
          firstName: certificationCourse2.firstName,
          lastName: certificationCourse2.lastName,
          examinerComment: null,
          certificationIssueReports: [],
          hasSeenEndTestScreen: certificationCourse2.hasSeenEndTestScreen,
        };
        expect(certificationReports).to.deep.equal([expectedCertificationReport1 , expectedCertificationReport2]);
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

  describe('#finalize', () => {

    afterEach(() => {
      return knex('certification-issue-reports').delete();
    });

    describe('when saving informations from certification report', () => {

      it('should save hasSeenEndTestScreen into certification course', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
        }).id;
        await databaseBuilder.commit();
        
        // when
        const hasSeenEndTestScreen = true;
        const certificationReport = domainBuilder.buildCertificationReport({
          certificationCourseId,
          hasSeenEndTestScreen,
        });
        await certificationReportRepository.finalize({ certificationReport });
  
        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);

        expect(actualCertificationReports[0].hasSeenEndTestScreen).to.equal(true);
      });

      it('should save examiner comment into certification-issue-report', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
        }).id;
        await databaseBuilder.commit();

        // when
        const examinerComment = 'Un commentaire examinateur';
        const certificationReport = domainBuilder.buildCertificationReport({
          certificationCourseId,
          examinerComment,
        });
        await certificationReportRepository.finalize({ certificationReport });

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);

        expect(actualCertificationReports[0].examinerComment).to.equal(examinerComment);
      });
    });
  });

  describe('#finalizeAll', () => {
    let certificationReport1;
    let certificationReport2;
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

      beforeEach(async () => {
        certificationReport1 = databaseBuilder.factory.buildCertificationReport({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationReport2 = databaseBuilder.factory.buildCertificationReport({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should finalize certification reports', async () => {
        // given
        certificationReport1.hasSeenEndTestScreen = true;
        certificationReport2.examinerComment = 'J\'aime les fruits et les poulets';

        // when
        await certificationReportRepository.finalizeAll([certificationReport1, certificationReport2]);

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
        const actualReport1 = _.find(actualCertificationReports, { id: certificationReport1.id });
        const actualReport2 = _.find(actualCertificationReports, { id: certificationReport2.id });
        expect(actualReport1.hasSeenEndTestScreen).to.equal(certificationReport1.hasSeenEndTestScreen);
        expect(actualReport2.examinerComment).to.equal(certificationReport2.examinerComment);
      });

      it('should save only not null examiner comment into certification-issue-report', async () => {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
          lastName: 'AAA',
          sessionId,
        }).id;
        const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
          lastName: 'BBB',
          sessionId,
        }).id;
        await databaseBuilder.commit();

        const notNullExaminerComment = 'Un commentaire examinateur';
        const nullExaminerComment = null;

        const certificationReportWithNotNullExaminerComment = domainBuilder.buildCertificationReport({
          certificationCourseId: certificationCourseId1,
          examinerComment: notNullExaminerComment,
        });
        const certificationReportWithNullExaminerComment = domainBuilder.buildCertificationReport({
          certificationCourseId: certificationCourseId2,
          examinerComment: nullExaminerComment,
        });

        // when
        await certificationReportRepository.finalizeAll([certificationReportWithNotNullExaminerComment, certificationReportWithNullExaminerComment]);

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
        expect(actualCertificationReports[0].certificationIssueReports[0].description).to.equal(notNullExaminerComment);
        expect(actualCertificationReports[1].certificationIssueReports.length).to.equal(0);
      });

    });

    context('when finalization fails', () => {

      beforeEach(async () => {
        certificationReport1 = databaseBuilder.factory.buildCertificationReport({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationReport2 = databaseBuilder.factory.buildCertificationReport({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should have left the Courses as they were and rollback updates if any', async () => {
        // given
        certificationReport1.examinerComment = 'J\'aime les fruits et les poulets';
        certificationReport2.hasSeenEndTestScreen = 'je suis supposé être un booléen';

        // when
        const error = await catchErr(certificationReportRepository.finalizeAll, certificationReportRepository)([certificationReport1, certificationReport2]);

        // then
        const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
        const actualReport1 = _.find(actualCertificationReports, { id: certificationReport1.id });
        const actualReport2 = _.find(actualCertificationReports, { id: certificationReport2.id });
        expect(actualReport2.examinerComment).to.equal(null);
        expect(actualReport1.hasSeenEndTestScreen).to.equal(false);
        expect(error).to.be.an.instanceOf(CertificationCourseUpdateError);
      });

    });

  });

});
