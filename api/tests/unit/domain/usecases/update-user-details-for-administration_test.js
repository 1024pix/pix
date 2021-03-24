const { domainBuilder, expect, sinon } = require('../../../test-helper');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Unit | UseCase | update-user-details-for-administration', function() {

  const userId = 1;

  const attributesToUpdate = {
    email: 'partial@update.net',
    firstName: 'firstName',
    lastName: 'lastName',
  };
  const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
    ...attributesToUpdate,
    schoolingRegistrations: [domainBuilder.buildSchoolingRegistrationForAdmin()],
  });

  let userRepository;

  beforeEach(function() {
    userRepository = {
      isEmailAllowedToUseForCurrentUser: sinon.stub().returns(true),
      updateUserDetailsForAdministration: sinon.stub().resolves(),
      getUserDetailsForAdmin: sinon.stub().resolves(expectedUserDetailsForAdmin),
    };
  });

  it('should update user email, firstName and lastName', async function() {
    // when
    const updatedUserDetailsForAdmin = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(updatedUserDetailsForAdmin).to.equal(expectedUserDetailsForAdmin);
  });
});
