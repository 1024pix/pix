import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Domain | Usecases | getActiveByUserIds', function () {
  describe('When there are users', function () {
    it('should return user details', async function () {
      // given

      const firstUser = new User(databaseBuilder.factory.buildUser({ id: 1, firstName: 'Théo', lastName: 'Courant' }));
      const secondUser = new User(databaseBuilder.factory.buildUser({ id: 2, firstName: 'Alex', lastName: 'Térieur' }));

      await databaseBuilder.commit();

      // when
      const users = await usecases.getActiveByUserIds({ userIds: [1, 2] });

      // then
      expect(users).to.have.deep.members([firstUser, secondUser]);
    });
  });

  describe('When user are anonymous or anonymized', function () {
    it('does not return non-active users', async function () {
      // given

      databaseBuilder.factory.buildUser({
        id: 1,
        firstName: '',
        lastName: '',
        isAnonymous: true,
        hasBeenAnonymised: false,
      });
      databaseBuilder.factory.buildUser({
        id: 2,
        firstName: '(anonymized)',
        lastName: '(anonymized)',
        isAnonymous: false,
        hasBeenAnonymised: true,
      });

      await databaseBuilder.commit();

      // when
      const users = await usecases.getActiveByUserIds({ userIds: [1, 2] });

      // then
      expect(users).to.lengthOf(0);
    });
  });
});
