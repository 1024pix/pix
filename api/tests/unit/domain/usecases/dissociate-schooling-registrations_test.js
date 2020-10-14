const { expect, sinon } = require('../../../test-helper');

const dissociateSchoolingRegistrations = require('../../../../lib/domain/usecases/dissociate-schooling-registrations');

describe('Unit | UseCase | dissociate-schooling-registrations', () => {

  let schoolingRegistrationRepository;
  let userRepository;

  beforeEach(() => {
    schoolingRegistrationRepository = {
      dissociateByUser: sinon.stub().resolves(),
      findByUserId: sinon.stub(),
    };
    userRepository = {
      getUserDetailsForAdmin: sinon.stub(),
    };
  });

  it('should dissociate schooling registrations by user id and return updated user', async () => {
    // given
    const userId = 1;
    const expectedUserDetailsForAdmin = {
      id: userId,
      isAssociatedWithSchoolingRegistration: false,
    };

    schoolingRegistrationRepository.findByUserId.resolves([]);
    userRepository.getUserDetailsForAdmin.resolves({ id: userId });

    // when
    const updatedUserDetailsForAdmin = await dissociateSchoolingRegistrations({
      userId,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

  it('should return updated user when it is not associated with schooling registration', async () => {
    // given
    const userId = 999;
    const expectedUserDetailsForAdmin = {
      id: userId,
      isAssociatedWithSchoolingRegistration: false,
    };

    schoolingRegistrationRepository.dissociateByUser.returns(null);
    schoolingRegistrationRepository.findByUserId.resolves([]);
    userRepository.getUserDetailsForAdmin.resolves({ id: userId });

    // when
    const updatedUserDetailsForAdmin = await dissociateSchoolingRegistrations({
      userId,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(updatedUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
