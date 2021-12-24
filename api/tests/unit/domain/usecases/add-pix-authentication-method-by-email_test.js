const { domainBuilder, expect, sinon } = require('../../../test-helper');
const addPixAuthenticationMethodByEmail = require('../../../../lib/domain/usecases/add-pix-authentication-method-by-email');

describe('Unit | UseCase | add-pix-authentication-method-by-email', function () {
  let userRepository, authenticationMethodRepository;

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
    };
    authenticationMethodRepository = {
      hasIdentityProviderPIX: sinon.stub(),
    };
  });

  it('should call checkIfEmailIsAvailable method to check email', async function () {
    // given
    const email = 'user@example.net';
    const user = domainBuilder.buildUser({ email });

    // when
    await addPixAuthenticationMethodByEmail({
      userId: user.id,
      email,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(userRepository.checkIfEmailIsAvailable).to.be.calledWith(email);
  });
});
