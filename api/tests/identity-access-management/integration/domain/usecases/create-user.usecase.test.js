import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | create-user', function () {
  it('returns the saved user', async function () {
    // given
    const userData = { firstName: 'First', lastName: 'Last', email: 'first.last@example.net', cgu: true };
    const user = new User(userData);
    const password = 'P@ssW0rd';

    // when
    const savedUser = await usecases.createUser({ password, user });

    // then
    expect(savedUser).to.be.instanceOf(User);
    expect(savedUser).to.include(userData);
  });
});
