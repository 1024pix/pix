import sinon from 'sinon';

import { ModuleIssueReport } from '../../../../../src/devcomp/domain/models/module/ModuleIssueReport.js';
import { createModuleIssueReport } from '../../../../../src/devcomp/domain/usecases/create-module-issue-report.js';

describe('Unit | UseCase | create-module-issue-report', function () {
  it('should call the repository with the right arguments', async function () {
    // given
    const moduleIssueReport = {
      moduleId: 1,
      passageId: 1,
      elementId: 1,
      comment: "C'est cassé chef",
      answer: 'La réponse D',
      userAgent: 'Mozilla/5.0',
      categoryKey: 'Bug',
    };
    const moduleIssueReportRepository = {
      save: sinon.stub(),
    };

    // when
    await createModuleIssueReport({
      moduleIssueReport,
      moduleIssueReportRepository,
    });

    // then
    expect(moduleIssueReportRepository.save).to.have.been.calledWithExactly(
      new ModuleIssueReport({ ...moduleIssueReport }),
    );
  });
});
