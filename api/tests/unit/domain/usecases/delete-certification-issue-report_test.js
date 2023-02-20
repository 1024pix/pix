import _ from 'lodash';
import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import deleteCertificationIssueReport from '../../../../lib/domain/usecases/delete-certification-issue-report';
import { ForbiddenAccess } from '../../../../lib/domain/errors';

describe('Unit | UseCase | delete-certification-issue-report', function () {
  const certificationCourseRepository = { get: () => _.noop() };
  const certificationIssueReportRepository = {
    delete: () => _.noop(),
    get: () => _.noop(),
  };
  const sessionRepository = { isFinalized: () => _.noop() };
  const certificationIssueReportId = 456;
  const userId = 789;
  const sessionId = 159;

  beforeEach(function () {
    const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: certificationIssueReportId });
    const certificationCourse = domainBuilder.buildCertificationCourse({
      id: certificationIssueReport.certificationCourseId,
      sessionId,
    });
    sinon.stub(certificationCourseRepository, 'get');
    certificationCourseRepository.get
      .withArgs(certificationIssueReport.certificationCourseId)
      .resolves(certificationCourse);
    sinon.stub(certificationIssueReportRepository, 'delete');
    sinon.stub(certificationIssueReportRepository, 'get');
    certificationIssueReportRepository.get.withArgs(certificationIssueReportId).resolves(certificationIssueReport);
    sinon.stub(sessionRepository, 'isFinalized');
  });

  it('should throw a ForbiddenAccess error when session is already finalized', async function () {
    // given
    sessionRepository.isFinalized.withArgs(sessionId).resolves(true);

    // when
    const error = await catchErr(deleteCertificationIssueReport)({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionRepository,
    });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should return deletion result', async function () {
    // given
    const deletionResult = Symbol('someValue');
    sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
    certificationIssueReportRepository.delete.withArgs(certificationIssueReportId).resolves(deletionResult);

    // when
    const actualDeletionResult = await deleteCertificationIssueReport({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionRepository,
    });

    // then
    expect(actualDeletionResult).to.equal(deletionResult);
  });
});
