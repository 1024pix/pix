import { changeUserLanguage } from '../../../../../src/identity-access-management/domain/usecases/change-user-language.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | change-user-language', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = {
      update: sinon.stub(),
      getFullById: sinon.stub(),
    };
  });

  it('updates user "lang" attribute', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    const language = 'jp';
    userRepository.update.resolves();
    userRepository.getFullById.resolves(updatedUser);

    // when
    const actualUpdatedUser = await changeUserLanguage({ userId, language, userRepository });

    // then
    expect(userRepository.update).to.have.been.calledWithExactly({ id: userId, lang: language });
    expect(userRepository.getFullById).to.have.been.calledWithExactly(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
