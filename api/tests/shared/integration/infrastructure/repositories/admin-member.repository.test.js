import sinon from 'sinon';

import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { adminMemberRepository } from '../../../../../src/shared/infrastructure/repositories/admin-member.repository.js';
import { AdminMember } from '../../../../../src/team/domain/models/AdminMember.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Shared | Infrastructure | Repositories | adminMember', function () {
  describe('#get', function () {
    it('should return admin member for given user id', async function () {
      // given
      await _buildUserWithPixAdminRole({ role: ROLES.METIER });
      const userWithPixAdminRole = await _buildUserWithPixAdminRole({ role: ROLES.SUPER_ADMIN });
      await databaseBuilder.commit();

      // when
      const member = await adminMemberRepository.get({ userId: userWithPixAdminRole.userId });

      // then
      expect(member).to.deep.include(
        new AdminMember({
          id: userWithPixAdminRole.id,
          userId: userWithPixAdminRole.userId,
          firstName: userWithPixAdminRole.firstName,
          lastName: userWithPixAdminRole.lastName,
          email: userWithPixAdminRole.email,
          role: 'SUPER_ADMIN',
          disabledAt: null,
        }),
      );
    });

    context('when does not exist', function () {
      it('should return undefined', async function () {
        // given & when
        const member = await adminMemberRepository.get({ userId: 1 });

        // then
        expect(member).to.be.undefined;
      });
    });

    context('when admin member is disabled', function () {
      let clock;
      const now = new Date('2022-02-16');

      beforeEach(async function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      });

      afterEach(async function () {
        clock.restore();
      });

      it('should return admin member details', async function () {
        // given
        await _buildUserWithPixAdminRole({ role: ROLES.CERTIF });
        const userWithPixAdminRole = await _buildUserWithPixAdminRole({
          role: ROLES.METIER,
          disabledAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const member = await adminMemberRepository.get({ userId: userWithPixAdminRole.userId });

        // then
        expect(member).to.deep.include(
          new AdminMember({
            id: userWithPixAdminRole.id,
            userId: userWithPixAdminRole.userId,
            firstName: userWithPixAdminRole.firstName,
            lastName: userWithPixAdminRole.lastName,
            email: userWithPixAdminRole.email,
            role: 'METIER',
            disabledAt: now,
          }),
        );
      });
    });
  });
});

function _buildUserWithPixAdminRole({ firstName, lastName, disabledAt, role } = {}) {
  const user = databaseBuilder.factory.buildUser({ firstName, lastName });
  const userWithPixAdminRole = databaseBuilder.factory.buildPixAdminRole({
    userId: user.id,
    disabledAt,
    role: role ?? ROLES.SUPER_ADMIN,
  });
  return {
    ...userWithPixAdminRole,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}
