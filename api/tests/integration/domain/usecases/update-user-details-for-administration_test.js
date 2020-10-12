const { expect,catchErr, databaseBuilder } = require('../../../test-helper');

const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Integration | UseCases | updateUserDetailsForAdministration', () => {

  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser({ email: 'email@example.net' }).id;
    databaseBuilder.factory.buildUser({ email: 'alreadyexist@example.net' });
    await databaseBuilder.commit();
  });

  it('should update user email, firstname and lastname', async () => {
    // given
    const userToUpdate = {
      email: 'partial@example.net',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    // when
    const result = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: userToUpdate,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(result).to.be.an.instanceOf(UserDetailsForAdmin);
    expect(result.email).equal(userToUpdate.email);
    expect(result.firstName).equal(userToUpdate.firstName);
    expect(result.lastName).equal(userToUpdate.lastName);
  });

  it('should update user email only', async () => {
    // given
    const userToUpdate = {
      email: 'partial@example.net',
    };

    // when
    const result = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: userToUpdate,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(result.email).equal(userToUpdate.email);
  });

  it('should update user and change attribute isAssociatedWithSchoolingRegistration when association exist', async () => {
    // given
    userId = databaseBuilder.factory.buildSchoolingRegistrationWithUser().userId;
    await databaseBuilder.commit();

    // when
    const result = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: { email: 'partial@example.net' },
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(result.isAssociatedWithSchoolingRegistration).to.be.true;
  });

  it('should throw AlreadyRegisteredEmailError when email is already used by another user', async () => {
    // given
    const userToUpdate = {
      email: 'alreadyEXIST@example.net',
    };

    // when
    const error = await catchErr(updateUserDetailsForAdministration)({
      userId,
      userDetailsForAdministration: userToUpdate,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(error).to.be.instanceOf(AlreadyRegisteredEmailError);
    expect(error.message).to.equal('Cet email est déjà utilisé.');
  });

});
