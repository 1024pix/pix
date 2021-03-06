const { expect } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipOrganizationRoleError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Membership', () => {

  describe('#validateRole', () => {

    context('when organizationRole is valid', () => {

      it('should not throw an error', () => {
        // given / when
        const membership = new Membership({
          id: 'bbb12aa3',
          organizationRole: 'ADMIN',
        });

        // then
        expect(() => membership.validateRole()).not.to.throw();
      });
    });

    context('when organizationRole is invalid', () => {

      it('should throw an InvalidMembershipOrganizationRoleError error', async () => {
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
