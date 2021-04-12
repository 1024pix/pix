const { domainBuilder, expect, sinon } = require('../../../test-helper');
const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Unit | UseCase | update-user-details-for-administration', () => {

  const userId = 1;

  let userRepository;

  beforeEach(() => {
    userRepository = {
      isEmailAllowedToUseForCurrentUser: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
    };
  });

  context('when user email must be updated', () => {

    it('should check the email availability', async () => {
      // given
      const userDetailsForAdministration = { email: 'email@example.net' };

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.isEmailAllowedToUseForCurrentUser).to.have.been.calledWith(userId, userDetailsForAdministration.email);
    });
  });

  context('when user email must not be updated', () => {

    it('should not check the email availability', async () => {
      // given
      const userDetailsForAdministration = {};

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.isEmailAllowedToUseForCurrentUser).to.not.have.been.called;
    });
  });

  it('should update userDetailsForAdministration data', async () => {
    // given
    const attributesToUpdate = {
      email: 'partial@update.net',
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'firstName.lastName1212',
    };

    userRepository.isEmailAllowedToUseForCurrentUser.returns(true);

    // when
    await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith(userId, attributesToUpdate);
  });

  it('should return the updated user details for admin', async () => {
    // given
    const attributesToUpdate = {
      email: 'partial@update.net',
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'firstName.lastName1212',
    };
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
      ...attributesToUpdate,
      schoolingRegistrations: [domainBuilder.buildSchoolingRegistrationForAdmin()],
    });
    userRepository.getUserDetailsForAdmin.resolves(expectedUserDetailsForAdmin);

    // when
    const updatedUserDetailsForAdmin = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });
    // then
    expect(updatedUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
