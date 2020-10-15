const { expect, sinon } = require('../../../test-helper');

const dissociateSchoolingRegistrations = require('../../../../lib/domain/usecases/dissociate-schooling-registrations');

describe('Unit | UseCase | dissociate-schooling-registrations', () => {

  let schoolingRegistrationRepository;
  let userRepository;

  beforeEach(() => {
    schoolingRegistrationRepository = {
      dissociateByUser: sinon.stub().resolves(),
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
      schoolingRegistrations: [],
    };

    userRepository.getUserDetailsForAdmin.resolves({ id: userId, schoolingRegistrations: [] });

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
