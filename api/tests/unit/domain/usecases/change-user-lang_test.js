const { expect, sinon } = require('../../../test-helper');
const changeUserLang = require('../../../../lib/domain/usecases/change-user-lang');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | change-user-lang', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateUserAttributes');
  });

  it('should modify user attributes to change lang', async () => {
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
