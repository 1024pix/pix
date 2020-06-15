const { expect, sinon } = require('../../../test-helper');
const anonymizeUser = require('../../../../lib/domain/usecases/anonymize-user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | anonymize-user', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateUserDetailsForAdministration').resolves();
  });

  it('should anonymize user', async () => {
    // given
    const userId = 1;
    const expectedAnonymizedUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
    };

    // when
    await anonymizeUser({ userId, userRepository });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly(userId, expectedAnonymizedUser);
  });
});
