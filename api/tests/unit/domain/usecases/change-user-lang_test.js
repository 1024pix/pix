const { expect, sinon } = require('../../../test-helper');
const changeUserLang = require('../../../../lib/domain/usecases/change-user-lang');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | change-user-lang', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'update').resolves();
    sinon.stub(userRepository, 'getFullById');
  });

  it('should modify user attributes to change lang', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    const lang = 'jp';
    userRepository.getFullById.resolves(updatedUser);

    // when
    const actualUpdatedUser = await changeUserLang({ userId, lang, userRepository });

    // then
    expect(userRepository.update).to.have.been.calledWith({ id: userId, lang });
    expect(userRepository.getFullById).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
