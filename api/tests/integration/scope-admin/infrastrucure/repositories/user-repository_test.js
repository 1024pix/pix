const { expect, databaseBuilder, knex, catchErr } = require('../../../../test-helper');
const userRepository = require('../../../../../lib/scope-admin/infrastructure/repositories/user-repository');
const { UserNotFoundError } = require('../../../../../lib/domain/errors');

const { ROLES } = require('../../../../../lib/domain/constants').PIX_ADMIN;

describe('Integration | Infrastructure | scope-admin | Repository | userRepository', function () {
  describe('#save', function () {
    afterEach(async function () {
      await knex('pix-admin-roles').delete();
    });

    it('saves all the attributes', async function () {
      const otherUser = databaseBuilder.factory.buildUser();
      const user = databaseBuilder.factory.buildUser({
        email: 'john.doe@example.net',
        firstName: 'John',
        lastName: 'Doe',
      });
      await databaseBuilder.commit();

      await userRepository.save({ userId: user.id, role: ROLES.CERTIF, disabledAt: '2022-01-01' });
      await userRepository.save({ userId: otherUser.id, role: ROLES.CERTIF });
      const actualUser = await userRepository.getByEmail(user.email);

      expect(actualUser.userId).to.equal(user.id);
      expect(actualUser.email).to.equal(user.email);
      expect(actualUser.firstName).to.equal(user.firstName);
      expect(actualUser.lastName).to.equal(user.lastName);
      expect(actualUser.disabledAt).to.deep.equal(new Date('2022-01-01'));
    });

    context('when there is no existing user for the user', function () {
      it('creates a new admin user role', async function () {
        const { id: userId, email } = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        await userRepository.save({ userId, role: ROLES.CERTIF });
        const user = await userRepository.getByEmail(email);

        expect(user.role).to.equal(ROLES.CERTIF);
      });
    });

    context('when there is an existing user for the user', function () {
      it('updates admin user role', async function () {
        const { id: userId, email } = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        await userRepository.save({ userId, role: ROLES.CERTIF });
        await userRepository.save({ userId, role: ROLES.METIER });
        const user = await userRepository.getByEmail(email);

        expect(user.role).to.equal(ROLES.METIER);
      });
    });
  });

  describe('#getByEmail', function () {
    it('should return user without role when exists', async function () {
      databaseBuilder.factory.buildUser({ email: 'kevin.feige@example.net' });
      const user = databaseBuilder.factory.buildUser({
        email: 'jon.favreau@example.net',
        firstName: 'Jon',
        lastName: 'Favreau',
      });
      await databaseBuilder.commit();

      const actualUser = await userRepository.getByEmail(user.email);

      expect(actualUser.id).to.equal(null);
      expect(actualUser.userId).to.equal(user.id);
      expect(actualUser.email).to.equal(user.email);
      expect(actualUser.firstName).to.equal(user.firstName);
      expect(actualUser.lastName).to.equal(user.lastName);
      expect(actualUser.role).to.equal(null);
      expect(actualUser.disabledAt).to.equal(null);
    });

    it('should return user role when exists', async function () {
      const otherUser = databaseBuilder.factory.buildUser({ email: 'kevin.feige@example.net' });
      databaseBuilder.factory.buildPixAdminRole({
        userId: otherUser.id,
        disabledAt: null,
        role: ROLES.CERTIF,
      });

      const user = databaseBuilder.factory.buildUser({
        email: 'jon.favreau@example.net',
        firstName: 'Jon',
        lastName: 'Favreau',
      });
      const userRole = databaseBuilder.factory.buildPixAdminRole({
        userId: user.id,
        disabledAt: new Date('2021-12-31'),
        role: ROLES.SUPPORT,
      });

      await databaseBuilder.commit();

      const actualUser = await userRepository.getByEmail(user.email);

      expect(actualUser.id).to.equal(userRole.id);
      expect(actualUser.userId).to.equal(user.id);
      expect(actualUser.email).to.equal(user.email);
      expect(actualUser.firstName).to.equal(user.firstName);
      expect(actualUser.lastName).to.equal(user.lastName);
      expect(actualUser.role).to.equal(userRole.role);
      expect(actualUser.disabledAt).to.deep.equal(userRole.disabledAt);
    });

    it('should throw an error when no user witrh email', async function () {
      databaseBuilder.factory.buildUser({
        email: 'jon.favreau@example.net',
        firstName: 'Jon',
        lastName: 'Favreau',
      });
      await databaseBuilder.commit();

      const error = await catchErr(userRepository.getByEmail)('tintinetmilou@example.net');

      //then
      expect(error).to.be.instanceof(UserNotFoundError);
      expect(error.code).to.equal('USER_ACCOUNT_NOT_FOUND');
    });
  });
});
