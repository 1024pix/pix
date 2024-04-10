import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ImportOrganizationLearnersJobHandler } from '../../../../../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJobHandler.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Handler | ImportOrganizationLearnersJobHandler', function () {
  it('should call usecase with given organizationId', async function () {
    const event = { organizationImportId: 1 };
    const organizationId = Symbol('organizationId');
    sinon.stub(usecases, 'addOrUpdateOrganizationLearners');
    const organizationImportRepositoryStub = {
      get: sinon.stub(),
    };

    organizationImportRepositoryStub.get.withArgs(event.organizationImportId).resolves({ organizationId });

    const handler = new ImportOrganizationLearnersJobHandler({
      organizationImportRepository: organizationImportRepositoryStub,
    });

    await handler.handle(event);

    expect(usecases.addOrUpdateOrganizationLearners).to.have.been.calledWithExactly({ organizationId });
  });
});
