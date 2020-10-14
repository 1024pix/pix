const { domainBuilder, expect, sinon } = require('../../../test-helper');

const UserDetailsForAdmin = require('../../../../lib/domain/models/UserDetailsForAdmin');

const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Unit | UseCase | update-user-details-for-administration', () => {

  const userId = 1;

  const attributesToUpdate = {
    email: 'partial@update.net',
    firstName: 'firstName',
    lastName: 'lastName',
  };
  const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin(attributesToUpdate);

  let userRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    userRepository = {
      isEmailAllowedToUseForCurrentUser: sinon.stub().returns(true),
      updateUserDetailsForAdministration: sinon.stub().resolves(expectedUserDetailsForAdmin),
    };

    schoolingRegistrationRepository = {
      findByUserId: sinon.stub().resolves([]),
    };
  });

  it('should update user email, firstName and lastName', async () => {
    // when
    const updatedUserDetailsForAdmin = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.be.instanceOf(UserDetailsForAdmin);
    expect(updatedUserDetailsForAdmin).to.equal(expectedUserDetailsForAdmin);
  });

  it('should update user and change attribute isAssociatedWithSchoolingRegistration when association exist', async () => {
    // given
    schoolingRegistrationRepository.findByUserId.resolves([{}]);
    expectedUserDetailsForAdmin.isAssociatedWithSchoolingRegistration = true;

    // when
    const updatedUserDetailsForAdmin = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
      schoolingRegistrationRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.equal(expectedUserDetailsForAdmin);
  });

});
