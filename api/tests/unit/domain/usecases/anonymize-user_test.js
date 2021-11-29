const { expect, sinon } = require('../../../test-helper');
const anonymizeUser = require('../../../../lib/domain/usecases/anonymize-user');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');

describe('Unit | UseCase | anonymize-user', function () {
  it('should anonymize user and delete all authentication methods', async function () {
    // given
    const userId = 1;
    const expectedAnonymizedUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
      username: null,
    };

    sinon.stub(userRepository, 'updateUserDetailsForAdministration').resolves();
    sinon.stub(authenticationMethodRepository, 'removeAllAuthenticationMethodsByUserId').resolves();

    // when
    await anonymizeUser({ userId, userRepository, authenticationMethodRepository });

    // then
    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
    });

    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly(
      userId,
      expectedAnonymizedUser
    );
  });
});
