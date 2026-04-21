import sinon from 'sinon';

import { membershipAdminController } from '../../../../../src/team/application/membership/membership.admin.controller.js';
import { UserOrganizationForAdmin } from '../../../../../src/team/domain/read-models/UserOrganizationForAdmin.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Team | Application | Controller | Membership Admin', function () {
  describe('#findUserOrganizationsForAdmin', function () {
    it('returns user’s organization memberships', async function () {
      // given
      const organizationMemberships = [new UserOrganizationForAdmin()];
      const organizationMembershipsSerialized = Symbol('an array of user’s organization memberships serialized');

      const userOrganizationForAdminSerializer = { serialize: sinon.stub() };
      userOrganizationForAdminSerializer.serialize
        .withArgs(organizationMemberships)
        .returns(organizationMembershipsSerialized);

      sinon.stub(usecases, 'findUserOrganizationsForAdmin').resolves(organizationMemberships);

      // when
      const request = {
        params: {
          id: 1,
        },
      };
      await membershipAdminController.findUserOrganizationsForAdmin(request, hFake, {
        userOrganizationForAdminSerializer,
      });

      // then
      expect(usecases.findUserOrganizationsForAdmin).to.have.been.calledWithExactly({ userId: 1 });
    });
  });
});
