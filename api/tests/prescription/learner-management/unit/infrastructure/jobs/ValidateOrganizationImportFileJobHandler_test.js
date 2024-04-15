import { eventBus } from '../../../../../../lib/domain/events/index.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ValidateOrganizationImportFileJobHandler } from '../../../../../../src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJobHandler.js';
import { ApplicationTransaction } from '../../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Handler | ValidateOrganizationImportFileJobHandler', function () {
  let domainTransaction;

  beforeEach(function () {
    sinon.stub(ApplicationTransaction, 'execute');
    sinon.stub(ApplicationTransaction, 'getTransactionAsDomainTransaction');

    domainTransaction = Symbol('domainTransaction');
    ApplicationTransaction.execute.callsFake((callback) => callback());
    ApplicationTransaction.getTransactionAsDomainTransaction.returns(domainTransaction);
  });

  it('should call usecase with given organizationId', async function () {
    const event = { organizationImportId: 1 };
    sinon.stub(usecases, 'validateSiecleXmlFile');

    const handler = new ValidateOrganizationImportFileJobHandler();

    await handler.handle(event);

    expect(usecases.validateSiecleXmlFile).to.have.been.calledWithExactly({
      organizationImportId: event.organizationImportId,
    });
  });

  it('should publish the validated file event', async function () {
    const organizationImportId = 1;
    const event = { organizationImportId };
    const validatedFileEventSymbol = Symbol('validatedFileEventSymbol');

    sinon.stub(usecases, 'validateSiecleXmlFile');
    sinon.stub(eventBus, 'publish');
    usecases.validateSiecleXmlFile.withArgs({ organizationImportId }).resolves(validatedFileEventSymbol);

    const handler = new ValidateOrganizationImportFileJobHandler();

    await handler.handle(event);

    expect(eventBus.publish).to.have.been.calledWithExactly(validatedFileEventSymbol, domainTransaction);
  });
});
