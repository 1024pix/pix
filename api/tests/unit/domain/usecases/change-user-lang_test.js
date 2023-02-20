import { expect, sinon } from '../../../test-helper';
import changeUserLang from '../../../../lib/domain/usecases/change-user-lang';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Unit | UseCase | change-user-lang', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'updateUserAttributes');
  });

  it('should modify user attributes to change lang', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    const lang = 'jp';
    userRepository.updateUserAttributes.resolves(updatedUser);

    // when
    const actualUpdatedUser = await changeUserLang({ userId, lang, userRepository });

    // then
    expect(userRepository.updateUserAttributes).to.have.been.calledWith(userId, { lang });
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
