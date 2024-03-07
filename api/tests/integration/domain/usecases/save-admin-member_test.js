import { saveAdminMember } from '../../../../lib/domain/usecases/save-admin-member.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { databaseBuilder, expect } from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

import * as adminMemberRepository from '../../../../src/shared/infrastructure/repositories/admin-member-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';

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
