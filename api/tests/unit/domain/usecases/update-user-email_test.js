const updateUserEmail = require('../../../../lib/domain/usecases/update-user-email');

const { sinon, expect } = require('../../../test-helper');

describe('Unit | UseCase | update-user-email', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { updateEmail: sinon.stub() };
  });

  it('should call updateEmail', async () => {
    // given
    const userId = 1;
    const newEmail = 'new_email@example.net';

    // when
    await updateUserEmail({
      userId,
      email: newEmail,
      userRepository,
    });

    // then
    expect(userRepository.updateEmail).to.have.been.calledWith({
      id: userId,
      email: newEmail,
    });
  });
});
