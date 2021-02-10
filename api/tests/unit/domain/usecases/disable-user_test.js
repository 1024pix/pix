const { expect, sinon } = require('../../../test-helper');
const disableUser = require('../../../../lib/domain/usecases/disable-user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | disable-user', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateUserDetailsForAdministration').resolves();
  });

  it('should disable user', async () => {
    // given
    const userId = 1;
    const disabledUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
      disabled: true,
    };

    // when
    await disableUser({ userId, userRepository });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly(userId, disabledUser);
  });
});
