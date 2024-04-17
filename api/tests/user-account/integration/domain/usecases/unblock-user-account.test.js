import { UserLogin } from '../../../../../src/authentication/domain/models/UserLogin.js';
import { usecases } from '../../../../../src/user-account/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | User-Account | Domain | UseCase | unblockUserAccount', function () {
  it('resets failure count, temporary blocked until date and blocked at date', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser({ email: 'email@example.net' }).id;
    databaseBuilder.factory.buildUser({ email: 'alreadyexist@example.net' });
    const userLoginId = databaseBuilder.factory.buildUserLogin({
      userId,
      failureCount: 50,
      blockedAt: new Date('2022-11-11'),
      temporaryBlockedUntil: new Date('2022-11-10'),
    }).id;
    await databaseBuilder.commit();

    // when
    const result = await usecases.unblockUserAccount({ userId });

    // then
    expect(result).to.be.an.instanceOf(UserLogin);
    expect(result.id).equal(userLoginId);
    expect(result.userId).equal(userId);
    expect(result.failureCount).equal(0);
    expect(result.temporaryBlockedUntil).equal(null);
    expect(result.blockedAt).equal(null);
  });
});
