const { expect, databaseBuilder } = require('../../../test-helper');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const AdminMember = require('../../../../lib/domain/read-models/AdminMember');
const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

describe('Integration | Infrastructure | Repository | adminMemberRepository', function () {
  describe('#findAll', function () {
    it('should return all users with a pix admin role', async function () {
      // given
      const userWithPixAdminRole = _buildUserWithPixAdminRole({ firstName: 'Marie', lastName: 'Tim' });
      const otherUserWithPixAdminRole = _buildUserWithPixAdminRole({ firstName: 'Alain', lastName: 'Verse' });
      await databaseBuilder.commit();

      // when
      const members = await adminMemberRepository.findAll();

      // then
      expect(members.length).to.equal(2);
      expect(members).to.have.deep.members([
        new AdminMember({
          id: userWithPixAdminRole.id,
          userId: userWithPixAdminRole.userId,
          firstName: userWithPixAdminRole.firstName,
          lastName: userWithPixAdminRole.lastName,
          email: userWithPixAdminRole.email,
          role: 'SUPER_ADMIN',
        }),
        new AdminMember({
          id: otherUserWithPixAdminRole.id,
          userId: otherUserWithPixAdminRole.userId,
          firstName: otherUserWithPixAdminRole.firstName,
          lastName: otherUserWithPixAdminRole.lastName,
          email: otherUserWithPixAdminRole.email,
          role: 'SUPER_ADMIN',
        }),
      ]);
    });

    it('should not return users without a pix admin role', async function () {
      // given
      _buildUserWithPixAdminRole();
      const userWithoutPixAdminRole = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const members = await adminMemberRepository.findAll();

      // then
      expect(members.length).to.equal(1);
      expect(members[0].id).to.not.equal(userWithoutPixAdminRole.id);
    });

    it('should return users sorted by first, then last name', async function () {
      // given
      _buildUserWithPixAdminRole({ firstName: 'Dmitri', lastName: 'Karamazov' });
      _buildUserWithPixAdminRole({ firstName: 'Alexei', lastName: 'Karamazov' });
      _buildUserWithPixAdminRole({ firstName: 'Dmitri', lastName: 'Fiodorovitch' });
      await databaseBuilder.commit();

      // when
      const members = await adminMemberRepository.findAll();

      // then
      expect(members[0].firstName).to.equal('Alexei');
      expect(members[1].firstName).to.equal('Dmitri');
      expect(members[2].firstName).to.equal('Dmitri');
      expect(members[0].lastName).to.equal('Karamazov');
      expect(members[1].lastName).to.equal('Fiodorovitch');
      expect(members[2].lastName).to.equal('Karamazov');
    });

    it('should not return users with disabled pix admin roles', async function () {
      // given
      _buildUserWithPixAdminRole();
      const userWithDisabledPixAdminRole = _buildUserWithPixAdminRole({ disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const members = await adminMemberRepository.findAll();

      // then
      expect(members.length).to.equal(1);
      expect(members[0].id).to.not.equal(userWithDisabledPixAdminRole.id);
    });
  });
});

function _buildUserWithPixAdminRole({ firstName, lastName, disabledAt, role } = {}) {
  const user = databaseBuilder.factory.buildUser({ firstName, lastName });
  const userWithPixAdminRole = databaseBuilder.factory.buildPixAdminRole({
    userId: user.id,
    disabledAt,
    role: role ?? PixAdminRole.roles.SUPER_ADMIN,
  });
  return {
    ...userWithPixAdminRole,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}
