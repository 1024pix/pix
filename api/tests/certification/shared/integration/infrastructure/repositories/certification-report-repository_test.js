import _ from 'lodash';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';
import { CertificationReport } from '../../../../../../src/certification/shared/domain/models/CertificationReport.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import * as certificationReportRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-report-repository.js';
import { CertificationCourseUpdateError } from '../../../../../../src/certification/shared/domain/errors.js';
import { CertificationIssueReportCategory } from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

describe('Integration | Repository | CertificationReport', function () {
  describe('#findBySessionId', function () {
    context('when there are some certification reports with the given session id', function () {
      it('should fetch, alphabetically sorted, the certification reports with a specific session ID', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Abba', sessionId });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse1.id,
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CERTIFICATION,
        });
        const certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Xubbu', sessionId });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse2.id,
          state: Assessment.states.COMPLETED,
          type: Assessment.types.CERTIFICATION,
        });
        const certificationIssueReport1 = databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId: certificationCourse1.id,
          category: CertificationIssueReportCategory.OTHER,
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
          isCompleted: true,
          certificationIssueReports: [{ ...certificationIssueReport1, isImpactful: true }],
          hasSeenEndTestScreen: certificationCourse1.hasSeenEndTestScreen,
        });
        const expectedCertificationReport2 = domainBuilder.buildCertificationReport({
          id: CertificationReport.idFromCertificationCourseId(certificationCourse2.id),
          certificationCourseId: certificationCourse2.id,
          firstName: certificationCourse2.firstName,
          lastName: certificationCourse2.lastName,
          isCompleted: true,
          certificationIssueReports: [],
          hasSeenEndTestScreen: certificationCourse2.hasSeenEndTestScreen,
        });
        expect(certificationReports).to.deep.equal([expectedCertificationReport1, expectedCertificationReport2]);
      });
    });

    context('when there is no certification reports with the given session ID', function () {
      it('should return an empty array', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;

        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        expect(certificationReports).to.deep.equal([]);
      });
    });
  });

  describe('#finalizeAll', function () {
    let sessionId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when reports are being successfully finalized', function () {
      it('should finalize certification reports', async function () {
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

    context('when finalization fails', function () {
      it('should have left the Courses as they were and rollback updates if any', async function () {
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
          examinerComment: "J'aime les fruits et les poulets",
          sessionId,
        });

        const certificationReport2 = domainBuilder.buildCertificationReport({
          certificationCourseId: certificationCourseId2,
          hasSeenEndTestScreen: 'je suis supposé être un booléen',
          examinerComment: null,
          sessionId,
        });

        // when
        const error = await catchErr(
          certificationReportRepository.finalizeAll,
          certificationReportRepository,
        )([certificationReport1, certificationReport2]);

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
