const {
  expect, databaseBuilder, domainBuilder,
} = require('../../../test-helper');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const getUserDetailsForAdmin = require('../../../../lib/domain/usecases/get-user-details-for-admin');

describe('Integration | UseCase | get-user-details-for-admin', function() {

  it('should return user details for admin without schooling registration association, by user id', async function() {
    // given
    const user = databaseBuilder.factory.buildUser();
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin(user);

    await databaseBuilder.commit();

    // when
    const foundUserDetailsForAdmin = await getUserDetailsForAdmin({ userId: user.id, userRepository });

    // then
    expect(foundUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(foundUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

  it('should return user details for admin with schooling registration association, by user id', async function() {
    // given
    const userInDB = databaseBuilder.factory.buildUser();
    const firstOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
    const firstSchoolingRegistrationInDB = databaseBuilder.factory.buildSchoolingRegistration({
      id: 1,
      userId: userInDB.id,
      organizationId: firstOrganizationInDB.id,
    });
    const secondOrganizationInDB = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
    const secondSchoolingRegistrationInDB = databaseBuilder.factory.buildSchoolingRegistration({
      id: 2,
      userId: userInDB.id,
      organizationId: secondOrganizationInDB.id,
    });
    await databaseBuilder.commit();

    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
      ...userInDB,
      schoolingRegistrations: [
        domainBuilder.buildSchoolingRegistrationForAdmin({
          ...firstSchoolingRegistrationInDB,
          organizationId: firstOrganizationInDB.id,
          organizationExternalId: firstOrganizationInDB.externalId,
          organizationName: firstOrganizationInDB.name,
        }),
        domainBuilder.buildSchoolingRegistrationForAdmin({
          ...secondSchoolingRegistrationInDB,
          organizationId: secondOrganizationInDB.id,
          organizationExternalId: secondOrganizationInDB.externalId,
          organizationName: secondOrganizationInDB.name,
        }),
      ],
    });

    // when
    const foundUserDetailsForAdmin = await getUserDetailsForAdmin({ userId: userInDB.id, userRepository });

    // then
    expect(foundUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(foundUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

});
