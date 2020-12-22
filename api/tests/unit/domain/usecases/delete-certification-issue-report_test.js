const _ = require('lodash');
const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const deleteCertificationIssueReport = require('../../../../lib/domain/usecases/delete-certification-issue-report');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | delete-certification-issue-report', () => {

  const certificationCourseRepository = { get: () => _.noop() };
  const certificationIssueReportRepository = {
    delete: () => _.noop(),
    get: () => _.noop(),
  };
  const sessionRepository = { isFinalized: () => _.noop() };
  const sessionAuthorizationService = { isAuthorizedToAccessSession: () => _.noop() };
  const certificationIssueReportId = 456;
  const userId = 789;
  const sessionId = 159;

  beforeEach(() => {
    const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: certificationIssueReportId });
    const certificationCourse = domainBuilder.buildCertificationCourse({
      id: certificationIssueReport.certificationCourseId,
      sessionId,
    });
    sinon.stub(certificationCourseRepository, 'get');
    certificationCourseRepository.get.withArgs(certificationIssueReport.certificationCourseId).resolves(certificationCourse);
    sinon.stub(certificationIssueReportRepository, 'delete');
    sinon.stub(certificationIssueReportRepository, 'get');
    certificationIssueReportRepository.get.withArgs(certificationIssueReportId).resolves(certificationIssueReport);
    sinon.stub(sessionRepository, 'isFinalized');
    sinon.stub(sessionAuthorizationService, 'isAuthorizedToAccessSession');
  });

  it('should throw a ForbiddenAccess error when user is not allowed to delete certification issue report', async () => {
    // given
    sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(false);

    // when
    const error = await catchErr(deleteCertificationIssueReport)({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionRepository,
      sessionAuthorizationService,
    });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should throw a ForbiddenAccess error when session is already finalized', async () => {
    // given
    sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(true);
    sessionRepository.isFinalized.withArgs(sessionId).resolves(true);

    // when
    const error = await catchErr(deleteCertificationIssueReport)({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionRepository,
      sessionAuthorizationService,
    });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should return deletion result', async () => {
    // given
    const deletionResult = Symbol('someValue');
    sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(true);
    sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
    certificationIssueReportRepository.delete.withArgs(certificationIssueReportId).resolves(deletionResult);

    // when
    const actualDeletionResult = await deleteCertificationIssueReport({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionRepository,
      sessionAuthorizationService,
    });

    // then
    expect(actualDeletionResult).to.equal(deletionResult);
  });
});
