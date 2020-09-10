const updateUserDetailsForAdministration_test = require('../../../../lib/domain/usecases/update-user-details-for-administration');
const { sinon } = require('../../../test-helper');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | update-user-details-for-administration', () => {

  const userId = 1;

  beforeEach(() => {
    sinon.stub(userRepository, 'updateUserDetailsForAdministration');
    sinon.stub(userRepository, 'isEmailAllowedToUseForCurrentUser');
  });

  it('should update user email,firstName,lastName', async () => {
    // given
    const userToUpdate = {
      id: userId,
      email: 'partial@update.net',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    userRepository.isEmailAllowedToUseForCurrentUser.withArgs(userId,userToUpdate.email).resolves();

    // when
    await updateUserDetailsForAdministration_test({
      userId,
      userDetailsForAdministration: userToUpdate,
      userRepository,
    });

    // then
    sinon.assert.calledOnce(userRepository.updateUserDetailsForAdministration);
    sinon.assert.calledWith(userRepository.updateUserDetailsForAdministration, userId);
  });

  it('should update user email only', async () => {
    // given
    const userToUpdate = {
      id: userId,
      email: 'partial@update.net',
    };

    userRepository.isEmailAllowedToUseForCurrentUser.withArgs(userId,userToUpdate.email).resolves();

    // when
    await updateUserDetailsForAdministration_test({
      userId,
      userDetailsForAdministration: userToUpdate,
      userRepository,
    });

    // then
    sinon.assert.calledOnce(userRepository.updateUserDetailsForAdministration);
    sinon.assert.calledWith(userRepository.updateUserDetailsForAdministration, userId);

  });

});
