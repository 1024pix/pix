const {
  expect, databaseBuilder, domainBuilder,
} = require('../../../test-helper');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');
const useCases = require('../../../../lib/domain/usecases');

describe('Integration | UseCase | get-user-details-for-admin', () => {

  it('should return user details for admin without schooling registration association, by user id', async () => {
    // given
    const user = databaseBuilder.factory.buildUser();
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin(user);

    await databaseBuilder.commit();

    // when
    const foundUserDetailsForAdmin = await useCases.getUserDetailsForAdmin({
      userId: user.id,
    });

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
    const foundUserDetailsForAdmin = await useCases.getUserDetailsForAdmin({ userId });

    // then
    expect(foundUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(foundUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

});
