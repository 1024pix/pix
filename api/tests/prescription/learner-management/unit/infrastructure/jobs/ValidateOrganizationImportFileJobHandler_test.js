import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ValidateOrganizationImportFileJob } from '../../../../../../src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJob.js';
import { ValidateOrganizationImportFileJobHandler } from '../../../../../../src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJobHandler.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Handler | ValidateOrganizationImportFileJobHandler', function () {
  it('should call usecase with given organizationId', async function () {
    const event = { organizationImportId: 1 };
    sinon.stub(usecases, 'validateSiecleXmlFile');

    const handler = new ValidateOrganizationImportFileJobHandler();

    await handler.handle(event);

    expect(usecases.validateSiecleXmlFile).to.have.been.calledWithExactly({
      organizationImportId: event.organizationImportId,
    });
  });

  describe('#name', function () {
    it('should return the name of the job', function () {
      const handler = new ValidateOrganizationImportFileJobHandler();

      expect(handler.name).to.equal(ValidateOrganizationImportFileJob.name);
    });
  });
});
