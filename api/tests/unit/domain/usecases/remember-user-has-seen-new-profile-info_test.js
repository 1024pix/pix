const { expect, sinon } = require('../../../test-helper');
const rememberUserHasSeenNewProfileInfo = require('../../../../lib/domain/usecases/remember-user-has-seen-new-profile-info');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | remember-user-has-seen-new-profile-info', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update user hasSeenNewProfileInfo', async () => {
    // given
    const userId = 1;
    userRepository.get.withArgs(userId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenNewProfileInfo: true }).resolves('ok');

    // when
    const result = await rememberUserHasSeenNewProfileInfo({ userId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });
});
