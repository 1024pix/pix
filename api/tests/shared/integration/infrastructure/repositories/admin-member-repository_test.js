import { expect, databaseBuilder, knex, catchErr, sinon } from '../../../../test-helper.js';
import * as adminMemberRepository from '../../../../../src/shared/infrastructure/repositories/admin-member-repository.js';
import { AdminMember } from '../../../../../lib/domain/models/AdminMember.js';

import { AdminMemberError } from '../../../../../src/access/authorization/domain/errors.js';
import { PIX_ADMIN } from '../../../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Shared | Infrastructure | Repositories | adminMemberRepository', function () {
  describe('#findAll', function () {
    it('should return all users with a pix admin role that are not disabled', async function () {
      // given
      const userWithPixAdminRole = _buildUserWithPixAdminRole({ firstName: 'Marie', lastName: 'Tim' });
      const otherUserWithPixAdminRole = _buildUserWithPixAdminRole({ firstName: 'Alain', lastName: 'Verse' });
      _buildUserWithPixAdminRole({
        firstName: 'Nordine',
        lastName: 'Ateur',
        disabledAt: new Date(),
      });
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
  });

  describe('#getById', function () {
    it('should return admin member for given id', async function () {
      // given
      await _buildUserWithPixAdminRole({ role: ROLES.METIER });
      const adminMember = await _buildUserWithPixAdminRole({ role: ROLES.SUPER_ADMIN });
      await databaseBuilder.commit();

      // when
      const member = await adminMemberRepository.getById(adminMember.id);

      // then
      expect(member).to.deep.include(
        new AdminMember({
          id: adminMember.id,
          userId: adminMember.userId,
          firstName: adminMember.firstName,
          lastName: adminMember.lastName,
          email: adminMember.email,
          role: 'SUPER_ADMIN',
          disabledAt: null,
        }),
      );
    });

    context('when does not exist', function () {
      it('should return undefined', async function () {
        // given & when
        const member = await adminMemberRepository.getById(1);

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
        const member = await adminMemberRepository.getById(userWithPixAdminRole.id);

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

  describe('#update', function () {
    let clock;
    const now = new Date('2022-02-16');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should return the given Admin role with new role', async function () {
      // given
      _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Pelle' });
      const user = _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche' });

      await databaseBuilder.commit();

      // when
      const member = await adminMemberRepository.update({
        id: user.id,
        attributesToUpdate: { role: ROLES.CERTIF },
      });

      // then
      expect(member).to.be.instanceOf(AdminMember);
      expect(member.id).to.equal(user.id);
      expect(member.role).to.equal(ROLES.CERTIF);
    });

    it('should update the updated at date', async function () {
      // given
      const { id } = _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche' });
      await databaseBuilder.commit();

      // when
      const userToUpdate = new AdminMember({ id, role: ROLES.CERTIF });
      await adminMemberRepository.update(userToUpdate);

      // then
      const userPixAdminRole = await knex.from('pix-admin-roles').where({ id }).first();
      expect(userPixAdminRole.updatedAt).to.deep.equal(now);
    });

    it('should throw error if admin member does not exist', async function () {
      // given
      const { id } = _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche' });
      await databaseBuilder.commit();

      // when
      const nonExistingAdminMember = new AdminMember({
        id: id + 1,
        role: ROLES.SUPER_ADMIN,
      });
      const error = await catchErr(adminMemberRepository.update)(nonExistingAdminMember);

      // then
      expect(error).to.be.instanceOf(AdminMemberError);
    });
  });

  describe('#deactivate', function () {
    let clock;
    const now = new Date('2022-02-16');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should update Admin role with disabledAt and updatedAt filled with the date', async function () {
      // given
      const adminMember = _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche' });

      await databaseBuilder.commit();

      // when
      await adminMemberRepository.deactivate({
        id: adminMember.id,
      });
      const deactivatedAdminMember = await knex('pix-admin-roles').where({ id: adminMember.id }).first();

      // then
      expect(deactivatedAdminMember.updatedAt).to.deep.equal(now);
      expect(deactivatedAdminMember.disabledAt).to.deep.equal(now);
    });

    it('should throw and error if admin member does not exist', async function () {
      // given
      _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche' });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(adminMemberRepository.deactivate)({ id: 345 });

      // then
      expect(error).to.be.instanceOf(AdminMemberError);
    });

    it('should throw and error if admin member exist but is already disabled', async function () {
      // given
      const toto = _buildUserWithPixAdminRole({ firstName: 'Sarah', lastName: 'Croche', disabledAt: now });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(adminMemberRepository.deactivate)({ id: toto.id });

      // then
      expect(error).to.be.instanceOf(AdminMemberError);
    });
  });

  describe('#save', function () {
    it('should persist admin member role', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      const pixAdminRole = {
        userId: user.id,
        role: ROLES.SUPER_ADMIN,
      };

      // when
      const result = await adminMemberRepository.save(pixAdminRole);

      // then
      expect(result).to.be.instanceOf(AdminMember);
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
