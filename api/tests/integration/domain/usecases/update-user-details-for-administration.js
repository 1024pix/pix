const { expect,catchErr, databaseBuilder } = require('../../../test-helper');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Integration | UseCases | updateUserDetailsForAdministration', () => {

  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser({ email: 'email@example.net' }).id;
    databaseBuilder.factory.buildUser({ email: 'alreadyexist@example.net'   });
    await databaseBuilder.commit();
  });

  it('should update user email,firstname,lastname', async () => {
    // given
    const userToUpdate = {
      id: userId,
      email: 'partial@example.net',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    // when
    const result = await updateUserDetailsForAdministration({ userRepository, userId, userDetailsForAdministration: userToUpdate });

    // then
    expect(result).to.be.an.instanceOf(UserDetailsForAdmin);
    expect(result.email).equal(userToUpdate.email);
    expect(result.firstName).equal(userToUpdate.firstName);
    expect(result.lastName).equal(userToUpdate.lastName);

  });

  it('should update user email only', async () => {
    // given
    const userToUpdate = {
      id: userId,
      email: 'partial@example.net',
    };

    // when
    const result = await updateUserDetailsForAdministration({ userRepository, userId: userId, userDetailsForAdministration: userToUpdate });

    // then
    expect(result).to.be.an.instanceOf(UserDetailsForAdmin);
    expect(result.email).equal(userToUpdate.email);

  });

  it('should throw AlreadyRegisteredEmailError when email il already used by another user', async () => {
    // given
    const userToUpdate = {
      id: userId,
      email: 'alreadyEXIST@example.net',
    };

    // when
    const error = await catchErr(updateUserDetailsForAdministration)({
      userRepository,
      userId,
      userDetailsForAdministration: userToUpdate,
    });

    // then
    expect(error).to.be.instanceOf(AlreadyRegisteredEmailError);
    expect(error.message).to.equal('Cet email est déjà utilisé.');

  });

});
