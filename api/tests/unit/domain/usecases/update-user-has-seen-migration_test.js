const { expect, sinon } = require('../../../test-helper');
const updateUserHasSeenMigration = require('../../../../lib/domain/usecases/update-user-has-seen-migration');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-pix-orga-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update updateUserHasSeenMigration', async () => {
    // given
    const userId = 1;
    userRepository.get.withArgs(userId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenMigration: true }).resolves('ok');

    // when
    const result = await updateUserHasSeenMigration({ userId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });

});
