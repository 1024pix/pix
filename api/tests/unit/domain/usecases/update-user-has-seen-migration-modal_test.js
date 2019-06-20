const { expect, sinon } = require('../../../test-helper');
const updateUserHasSeenMigrationModal = require('../../../../lib/domain/usecases/update-user-has-seen-migration-modal');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | update-user-has-seen-migration-modal', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update user hasSeenMigrationModal', async () => {
    // given
    const userId = 1;
    userRepository.get.withArgs(userId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenMigrationModal: true }).resolves('ok');

    // when
    const result = await updateUserHasSeenMigrationModal({ userId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });

});
