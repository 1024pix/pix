const {
  expect, databaseBuilder, domainBuilder,
} = require('../../../test-helper');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const getUserDetailsForAdmin = require('../../../../lib/domain/usecases/get-user-details-for-admin');

describe('Integration | UseCase | get-user-details-for-admin', () => {

  it('should return user details for admin without schooling registration association, by user id', async () => {
    // given
    const user = databaseBuilder.factory.buildUser();
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
      ...user,
      isAssociatedWithSchoolingRegistration: false,
    });

    await databaseBuilder.commit();

    // when
    const foundUserDetailsForAdmin = await getUserDetailsForAdmin({ userId: user.id, userRepository, schoolingRegistrationRepository });

    // then
    expect(foundUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(foundUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

  it('should return user details for admin with schooling registration association, by user id', async () => {
    // given
    const user = domainBuilder.buildUser();
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
      ...user,
      isAssociatedWithSchoolingRegistration: true,
    });

    const { userId } = databaseBuilder.factory.buildSchoolingRegistrationWithUser({ user });
    await databaseBuilder.commit();

    // when
    const foundUserDetailsForAdmin = await getUserDetailsForAdmin({ userId, userRepository, schoolingRegistrationRepository });

    // then
    expect(foundUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(foundUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

});
