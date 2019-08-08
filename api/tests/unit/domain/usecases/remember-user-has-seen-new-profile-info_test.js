const { expect, sinon, catchErr } = require('../../../test-helper');
const rememberUserHasSeenNewProfileInfo = require('../../../../lib/domain/usecases/remember-user-has-seen-new-profile-info');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | remember-user-has-seen-new-profile-info', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update user hasSeenNewProfileInfo', async () => {
    // given
    const authenticatedUserId = 1;
    const requestedUserId = 1;
    userRepository.get.withArgs(requestedUserId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenNewProfileInfo: true }).resolves('ok');

    // when
    const result = await rememberUserHasSeenNewProfileInfo({ authenticatedUserId, requestedUserId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });

  it('should throw an error if authenticated user is different from requested user', async () => {
    // given
    const authenticatedUserId = 1;
    const requestedUserId = 2;

    // when
    const result = await catchErr(rememberUserHasSeenNewProfileInfo)({ authenticatedUserId, requestedUserId, userRepository });

    // then
    expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

});
