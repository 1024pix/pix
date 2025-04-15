import { User } from '../../../../../src/profile/domain/models/User.js';
import * as userRepository from '../../../../../src/profile/infrastructure/repositories/user-repository.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Profile | Infrastructure | Repositories | UserRepository', function () {
  it('should return users', async function () {
    // given
    const userIds = [1, 2];
    const usersApi = {
      getActiveByUserIds: sinon.stub(),
    };
    const usersFromApi = [
      { id: 1, firstName: 'Théo', lastName: 'Courant' },
      { id: 2, firstName: 'Alex', lastName: 'Térieur' },
    ];
    const expectedUsers = usersFromApi.map((user) => new User(user));
    usersApi.getActiveByUserIds.withArgs({ userIds }).resolves(usersFromApi);

    // when
    const users = await userRepository.getByIds({ userIds, usersApi });

    // then
    expect(users).to.deep.equal(expectedUsers);
  });
});
