const updateUserEmail = require('../../../../lib/domain/usecases/update-user-email');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

const { sinon, expect, catchErr } = require('../../../test-helper');

describe('Unit | UseCase | update-user-email', () => {

  let userRepository;

  beforeEach(() => {
    userRepository = { updateEmail: sinon.stub(), isEmailAvailable: sinon.stub() };
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

  it('throw AlreadyRegisteredEmailError if email already exist', async () => {
    // given
    userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
    const userId = 1;
    const newEmail = 'new_email@example.net';

    // when
    const error = await catchErr(updateUserEmail)({
      userId,
      email: newEmail,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(AlreadyRegisteredEmailError);
  });
});
