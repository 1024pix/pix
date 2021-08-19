const { expect, sinon } = require('../../../test-helper');

const dissociateSchoolingRegistrations = require('../../../../lib/domain/usecases/dissociate-schooling-registrations');

describe('Unit | UseCase | dissociate-schooling-registrations', function() {

  let schoolingRegistrationRepository;
  let userRepository;

  beforeEach(function() {
    schoolingRegistrationRepository = {
      findByUserIdAndSCOOrganization: sinon.stub(),
      dissociateUserFromSchoolingRegistrationIds: sinon.stub().resolves(),
    };
    userRepository = {
      getUserDetailsForAdmin: sinon.stub(),
    };
  });

  context('When user is not associated to SCO organizations', function() {

    it('should not dissociate user', async function() {
      // given
      const userId = 1;
      schoolingRegistrationRepository.findByUserIdAndSCOOrganization.resolves([]);
      userRepository.getUserDetailsForAdmin.resolves({ id: userId, schoolingRegistrations: [] });

      // when
      await dissociateSchoolingRegistrations({
        userId,
        schoolingRegistrationRepository,
        userRepository,
      });

      // then
      expect(schoolingRegistrationRepository.dissociateUserFromSchoolingRegistrationIds).to.not.have.been.called;
    });
  });

  it('should dissociate user from schooling registrations and return updated user', async function() {
    // given
    const userId = 1;
    const expectedSchoolingRegistration = { id: 1 };
    const expectedUserDetailsForAdmin = {
      id: userId,
      schoolingRegistrations: [],
    };

    schoolingRegistrationRepository.findByUserIdAndSCOOrganization.resolves([expectedSchoolingRegistration]);
    userRepository.getUserDetailsForAdmin.resolves({ id: userId, schoolingRegistrations: [] });

    // when
    const updatedUserDetailsForAdmin = await dissociateSchoolingRegistrations({
      userId,
      schoolingRegistrationRepository,
      userRepository,
    });

    // then
    expect(schoolingRegistrationRepository.dissociateUserFromSchoolingRegistrationIds).to.have.been.calledWith([expectedSchoolingRegistration.id]);
    expect(updatedUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
