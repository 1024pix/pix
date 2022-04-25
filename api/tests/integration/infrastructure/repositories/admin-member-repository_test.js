const { expect, databaseBuilder } = require('../../../test-helper');
const adminMemberRepository = require('../../../../lib/infrastructure/repositories/admin-member-repository');
const AdminMember = require('../../../../lib/domain/read-models/AdminMember');
const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

describe('Integration | Infrastructure | Repository | adminMemberRepository', function () {
  describe('#findAll', function () {
    it('should return all users with a pix admin role', async function () {
      // given
      const userWithPixAdminRole = _buildUserWithPixAdminRole();
      const otherUserWithPixAdminRole = _buildUserWithPixAdminRole();
      await databaseBuilder.commit();

      // when
      const members = await adminMemberRepository.findAll();

      // then
      expect(members.length).to.equal(2);
      expect(members).to.deep.include(
        new AdminMember({
          id: userWithPixAdminRole.id,
          firstName: userWithPixAdminRole.firstName,
          lastName: userWithPixAdminRole.lastName,
          email: userWithPixAdminRole.email,
          role: 'SUPER_ADMIN',
        })
      );
      expect(members[1].id).to.deep.equal(otherUserWithPixAdminRole.id);
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
  const userWithPixAdminRole = databaseBuilder.factory.buildUser({ firstName, lastName });
  databaseBuilder.factory.buildPixAdminRole({
    userId: userWithPixAdminRole.id,
    disabledAt,
    role: role ?? PixAdminRole.roles.SUPER_ADMIN,
  });
  return userWithPixAdminRole;
}
