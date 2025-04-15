import { organizationController } from '../../../../lib/application/organizations/organization-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Application | Organizations | organization-controller', function () {
  describe('#findChildrenOrganizationsForAdmin', function () {
    it('calls findChildrenOrganizationsForAdmin usecase and returns a serialized list of organizations', async function () {
      // given
      const parentOrganizationId = 1;
      const organizations = Symbol('child organizations list');
      const childOrganizationsSerialized = Symbol('child organizations serialized list');
      const dependencies = {
        organizationForAdminSerializer: { serialize: sinon.stub() },
      };

      sinon.stub(usecases, 'findChildrenOrganizationsForAdmin').resolves(organizations);
      dependencies.organizationForAdminSerializer.serialize.resolves(childOrganizationsSerialized);

      const request = {
        params: { organizationId: parentOrganizationId },
      };

      // when
      const response = await organizationController.findChildrenOrganizationsForAdmin(request, hFake, dependencies);

      // then
      expect(usecases.findChildrenOrganizationsForAdmin).to.have.been.calledWithExactly({ parentOrganizationId });
      expect(dependencies.organizationForAdminSerializer.serialize).to.have.been.calledWithExactly(organizations);
      expect(response).to.deep.equal(childOrganizationsSerialized);
    });
  });
});
