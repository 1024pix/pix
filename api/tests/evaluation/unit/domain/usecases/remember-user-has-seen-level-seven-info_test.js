import { rememberUserHasSeenLevelSevenInfo } from '../../../../../src/evaluation/domain/usecases/remember-user-has-seen-level-seven-info.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | remember-user-has-seen-level-seven-info', function () {
  it('should return user information', async function () {
    // given
    const userRepository = { updateMarkLevelSevenInfoAsSeen: sinon.stub() };
    const userId = 1;
    userRepository.updateMarkLevelSevenInfoAsSeen.withArgs({ userId }).resolves();

    // when
    await rememberUserHasSeenLevelSevenInfo({
      userId,
      userRepository,
    });

    // then
    expect(userRepository.updateMarkLevelSevenInfoAsSeen).to.have.been.calledOnce;
  });
});
