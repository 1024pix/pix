const { expect, databaseBuilder } = require('../../../test-helper');
const saveAdminMember = require('../../../../lib/domain/usecases/save-admin-member');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Integration | UseCases | save-admin-member', function () {
  context('when admin member exists and is disabled', function () {
    it('should reactivate admin member, update role if necessary, and return user details', async function () {
      // given
      const email = 'ice.bot@example.net';
      databaseBuilder.factory.buildUser.withRole({
        firstName: 'Sarah',
        lastName: 'Croche',
        email,
        disabledAt: new Date(),
      });
      await databaseBuilder.commit();

      // when
      const reactivatedAdminMember = await saveAdminMember({
        email,
        role: ROLES.SUPPORT,
        adminMemberRepository,
        userRepository,
      });

      // then
      expect(reactivatedAdminMember).to.contain({
        disabledAt: null,
        role: ROLES.SUPPORT,
        firstName: 'Sarah',
        lastName: 'Croche',
      });
    });
  });
});
