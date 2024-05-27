import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | organization', function () {
  describe('#addOrganizationFeatureInBatch', function () {
    let filePath, request;

    beforeEach(function () {
      filePath = Symbol('filePath');
      request = { payload: { path: filePath } };
      sinon.stub(usecases, 'addOrganizationFeatureInBatch').resolves();
    });

    it('calls the usecase to create organization feature', async function () {
      // given
      hFake.request = {
        path: '/api/admin/organizations/add-multiple-organization-features',
      };

      // when
      await organizationAdminController.addOrganizationFeatureInBatch(request, hFake);

      // then
      expect(usecases.addOrganizationFeatureInBatch).to.have.been.calledWithExactly({
        filePath,
      });
    });
  });

  describe('#updateOrganizationsInBatch', function () {
    let filePath, request;

    beforeEach(function () {
      filePath = Symbol('filePath');
      request = { payload: { path: filePath } };
      sinon.stub(usecases, 'updateOrganizationsInBatch').resolves();
    });

    it('calls the usecase to update organizations', async function () {
      // given
      hFake.request = {
        path: '/api/admin/organizations/update-organizations',
      };

      // when
      await organizationAdminController.updateOrganizationsInBatch(request, hFake);

      // then
      expect(usecases.updateOrganizationsInBatch).to.have.been.calledWithExactly({
        filePath,
      });
    });
  });
});
