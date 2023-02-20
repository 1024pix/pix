import { expect, databaseBuilder } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';
import UserLogin from '../../../../lib/domain/models/UserLogin';

describe('Integration | UseCases | unblockUserAccount', function () {
  it('should reset failure count, temporary blocked until date and blocked at date', async function () {
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
