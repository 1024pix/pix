import { organizationImportController } from '../../../../../src/prescription/learner-management/application/organization-import-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Learner Management | organization-import-controller', function () {
  let dependencies, serializeStub, usecaseResultSymbol;
  const organizationId = 123;
  const request = {
    params: { organizationId },
  };

  beforeEach(function () {
    sinon.stub(usecases, 'getOrganizationImportStatus');
    usecaseResultSymbol = Symbol();
    usecases.getOrganizationImportStatus.resolves(usecaseResultSymbol);
    serializeStub = sinon.stub();
    dependencies = { organizationImportDetailSerializer: { serialize: serializeStub } };
  });

  it('should get last organization import', async function () {
    hFake.request = {
      path: `/api/organizations/${organizationId}/import-information`,
    };
    await organizationImportController.getOrganizationImportStatus(request, hFake, dependencies);
    expect(usecases.getOrganizationImportStatus).to.have.been.calledOnceWithExactly({ organizationId });
    expect(serializeStub).to.have.been.calledOnceWithExactly(usecaseResultSymbol);
  });
});
