import _ from 'lodash';
import sinon from 'sinon';

import { deleteCertificationIssueReport } from '../../../../../../src/certification/session-management/domain/usecases/delete-certification-issue-report.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | delete-certification-issue-report', function () {
  const certificationCourseRepository = { getSessionId: () => _.noop() };
  let certificationIssueReportRepository;
  const sessionManagementRepository = { isFinalized: () => _.noop() };
  const certificationIssueReportId = 456;
  const userId = 789;
  const sessionId = 159;

  beforeEach(function () {
    const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ id: certificationIssueReportId });
    sinon.stub(certificationCourseRepository, 'getSessionId');
    certificationCourseRepository.getSessionId
      .withArgs({ id: certificationIssueReport.certificationCourseId })
      .resolves(sessionId);
    certificationIssueReportRepository = {
      remove: sinon.stub(),
      get: sinon.stub(),
    };
    certificationIssueReportRepository.get
      .withArgs({ id: certificationIssueReportId })
      .resolves(certificationIssueReport);
    sinon.stub(sessionManagementRepository, 'isFinalized');
  });

  it('should throw a ForbiddenAccess error when session is already finalized', async function () {
    // given
    sessionManagementRepository.isFinalized.withArgs({ id: sessionId }).resolves(true);

    // when
    const error = await catchErr(deleteCertificationIssueReport)({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionManagementRepository,
    });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should return deletion result', async function () {
    // given
    const deletionResult = Symbol('someValue');
    sessionManagementRepository.isFinalized.withArgs({ id: sessionId }).resolves(false);
    certificationIssueReportRepository.remove.withArgs({ id: certificationIssueReportId }).resolves(deletionResult);

    // when
    const actualDeletionResult = await deleteCertificationIssueReport({
      certificationIssueReportId,
      userId,
      certificationCourseRepository,
      certificationIssueReportRepository,
      sessionManagementRepository,
    });

    // then
    expect(actualDeletionResult).to.equal(deletionResult);
  });
});
