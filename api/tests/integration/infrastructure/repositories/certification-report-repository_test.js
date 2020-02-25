const _ = require('lodash');
const { databaseBuilder, expect, catchErr } = require('../../../test-helper');
const { CertificationReport } = require('../../../../lib/domain/models/CertificationReport');
const certificationReportRepository = require('../../../../lib/infrastructure/repositories/certification-report-repository');
const { CertificationCourseUpdateError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CertificationReport', function() {

  describe('#findBySessionIdWithCertificationCourse', () => {
    let sessionId;
    let certificationCourseId1;
    let certificationCourseId2;

    beforeEach(async () => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      // In session
      certificationCourseId1 = databaseBuilder.factory.buildCertificationReport(
        { lastName: 'Jackson', firstName: 'Michaele', sessionId, userId1, examinerComment: 'coucou' }
      ).certificationCourseId;
      certificationCourseId2 = databaseBuilder.factory.buildCertificationReport(
        { lastName: 'Jackson', firstName: 'Janet', sessionId, userId2, examinerComment: '' }
      ).certificationCourseId;
      // In other session
      databaseBuilder.factory.buildCertificationReport({ lastName: 'Jackson', firstName: 'Michaele', anotherSessionId, userId1 }).id;

      await databaseBuilder.commit();
    });

    context('when there are some certification reports with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification reports with a specific session ID', async () => {
        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        expect(certificationReports).to.deep.equal([
          {
            id: CertificationReport.idFromCertificationCourseId(certificationCourseId2),
            certificationCourseId: certificationCourseId2,
            firstName: 'Janet',
            lastName: 'Jackson',
            examinerComment: '',
            hasSeenEndTestScreen: false,
          },
          {
            id: CertificationReport.idFromCertificationCourseId(certificationCourseId1),
            certificationCourseId: certificationCourseId1,
            firstName: 'Michaele',
            lastName: 'Jackson',
            examinerComment: 'coucou',
            hasSeenEndTestScreen: false,
          },
        ]);
      });
    });

    context('when there is no certification reports with the given session ID', function() {

      it('should return an empty array', async () => {
        // when
        const certificationReports = await certificationReportRepository.findBySessionId(-1);

        // then
        expect(certificationReports).to.deep.equal([]);
      });

    });

  });
  describe('#finalize', () => {
    let certificationReport;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    beforeEach(async () => {
      certificationReport = databaseBuilder.factory.buildCertificationReport({
        hasSeenEndTestScreen: false,
        examinerComment: null,
        sessionId,
      });

      return databaseBuilder.commit();
    });

    it('should return the finalized certification courses', async () => {
      // given
      certificationReport.hasSeenEndTestScreen = true;
      certificationReport.examinerComment = 'J\'aime les fruits et les poulets';

      // when
      await certificationReportRepository.finalize({ certificationReport });

      // then
      const actualCertificationReports = await certificationReportRepository.findBySessionId(sessionId);
      expect(actualCertificationReports[0].hasSeenEndTestScreen).to.equal(certificationReport.hasSeenEndTestScreen);
      expect(actualCertificationReports[0].examinerComment).to.equal(certificationReport.examinerComment);
    });

  });

  describe('#finalizeAll', () => {
    let certificationReport1;
    let certificationReport2;
    let sessionId;

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
