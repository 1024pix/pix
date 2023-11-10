import { expect, knex, databaseBuilder, catchErr } from '../../../test-helper.js';
import { OrganizationLearnerAlreadyLinkedToUserError } from '../../../../lib/domain/errors.js';
import { User } from '../../../../lib/domain/models/User.js';
import * as UserToCreateRepository from '../../../../lib/infrastructure/repositories/user-to-create-repository.js';
import { UserToCreate } from '../../../../lib/domain/models/UserToCreate.js';

describe('Integration | Infrastructure | Repository | UserToCreateRepository', function () {
  describe('#create', function () {
    it('returns a domain User object', async function () {
      // given
      const email = 'my-email-to-save@example.net';
      const user = new UserToCreate({
        firstName: 'laura',
        lastName: 'lune',
        email,
        cgu: true,
        locale: 'fr-FR',
      });

      // when
      const userSaved = await UserToCreateRepository.create({ user });

      // then
      const usersSavedInDatabase = await knex('users').select();
      expect(usersSavedInDatabase).to.have.lengthOf(1);
      expect(userSaved).to.be.an.instanceOf(User);
      expect(userSaved.firstName).to.equal(user.firstName);
      expect(userSaved.lastName).to.equal(user.lastName);
      expect(userSaved.email).to.equal(user.email);
      expect(userSaved.cgu).to.equal(user.cgu);
      expect(userSaved.locale).to.equal(user.locale);
    });

    it('should throw a custom error when username is already taken', async function () {
      // given
      const alreadyExistingUserName = 'thierryDicule1234';
      databaseBuilder.factory.buildUser({ id: 7, username: alreadyExistingUserName });
      await databaseBuilder.commit();

      const now = new Date('2022-02-01');
      const user = new UserToCreate({
        firstName: 'Thierry',
        lastName: 'Dicule',
        username: alreadyExistingUserName,
        createdAt: now,
        updatedAt: now,
      });

      // when
      const error = await catchErr(UserToCreateRepository.create)({ user });

      // then
      expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
    });
  });
});
