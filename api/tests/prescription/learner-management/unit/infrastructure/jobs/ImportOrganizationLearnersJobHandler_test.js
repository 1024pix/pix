import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ImportOrganizationLearnersJobHandler } from '../../../../../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJobHandler.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Handler | ImportOrganizationLearnersJobHandler', function () {
  it('should call usecase with given organizationId', async function () {
    const event = { organizationImportId: 1 };
    sinon.stub(usecases, 'addOrUpdateOrganizationLearners');

    const handler = new ImportOrganizationLearnersJobHandler();

    await handler.handle(event);

    expect(usecases.addOrUpdateOrganizationLearners).to.have.been.calledWithExactly({
      organizationImportId: event.organizationImportId,
    });
  });
});
