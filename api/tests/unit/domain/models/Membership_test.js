const { expect } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipRoleError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Membership', () => {

  describe('#validateRole', () => {

    context('when organizationRole is valid', () => {

      it('should not throw an error', () => {
        // given / when
        const membership = new Membership({
          id: 'bbb12aa3',
          organizationRole: 'ADMIN',
          updatedByUserId: undefined,
          organization: undefined,
          user: undefined,
        });

        // then
        expect(() => membership.validateRole()).not.to.throw();
      });
    });

    context('when organizationRole is invalid', () => {

      it('should throw an InvalidMembershipRoleError error', async () => {
        // given / when
        const membership = new Membership({
          id: '123',
          organizationRole: 'SUPERADMIN',
          updatedByUserId: null,
          organization: null,
          user: null,
        });

        // then
        expect(() => membership.validateRole()).to.throw(InvalidMembershipRoleError);
      });

    });

  });
});
