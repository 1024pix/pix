import { expect } from '../../../test-helper';
import Membership from '../../../../lib/domain/models/Membership';
import { InvalidMembershipOrganizationRoleError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | Membership', function () {
  describe('#validateRole', function () {
    context('when organizationRole is valid', function () {
      it('should not throw an error', function () {
        // given / when
        const membership = new Membership({
          id: 'bbb12aa3',
          organizationRole: 'ADMIN',
        });

        // then
        expect(() => membership.validateRole()).not.to.throw();
      });
    });

    context('when organizationRole is invalid', function () {
      it('should throw an InvalidMembershipOrganizationRoleError error', async function () {
        // given / when
        const membership = new Membership({
          id: '123',
          organizationRole: 'SUPERADMIN',
        });

        // then
        expect(() => membership.validateRole()).to.throw(InvalidMembershipOrganizationRoleError);
      });
    });
  });
});
