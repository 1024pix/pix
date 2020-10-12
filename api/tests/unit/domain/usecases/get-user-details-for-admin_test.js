const { expect, sinon } = require('../../../test-helper');

const getUserDetailsForAdmin = require('../../../../lib/domain/usecases/get-user-details-for-admin');

describe('Unit | UseCase | get-user-details-for-admin', () => {

  let userRepository;
  let schoolingRegistrationRepository;

  beforeEach(() => {
    userRepository = { getUserDetailsForAdmin: sinon.stub() };
    schoolingRegistrationRepository = { findByUserId: sinon.stub() };
  });

  it('should get the user details in adminstration contexte', async () => {
    // given
    const userId = 1;
    const expectedUserDetailsForAdmin = {
      id: userId,
      isAssociatedWithSchoolingRegistration: true,
    };

    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves({ id: userId });
    schoolingRegistrationRepository.findByUserId.withArgs({ userId }).resolves([{ id: 10 }]);

    // when
    const result = await getUserDetailsForAdmin({ userId, userRepository, schoolingRegistrationRepository });

    // then
    expect(result).to.deep.equal(expectedUserDetailsForAdmin);
  });
});
