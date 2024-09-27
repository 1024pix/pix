import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { organizationImportController } from '../../../../../src/prescription/learner-management/application/organization-import-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';
describe('Unit | Application | Learner Management | organization-import-controller', function () {
  let dependencies, serializeStub, usecaseResultSymbol;

  describe('#getOrganizationImportStatus', function () {
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

  describe('#updateOrganizationLearnerImportFormats', function () {
    let request, payload;

    beforeEach(function () {
      payload = Symbol('Payload');
      request = {
        payload,
      };

      sinon.stub(DomainTransaction, 'execute');
      DomainTransaction.execute.callsFake((callback) => callback());

      sinon.stub(usecases, 'updateOrganizationLearnerImportFormats');
      usecases.updateOrganizationLearnerImportFormats.resolves(null);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should update organization import format', async function () {
      await organizationImportController.updateOrganizationLearnerImportFormats(request);
      expect(usecases.updateOrganizationLearnerImportFormats).to.have.been.calledOnceWithExactly({
        payload,
      });
    });
  });
});
