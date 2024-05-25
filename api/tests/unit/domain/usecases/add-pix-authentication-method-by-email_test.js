import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { addPixAuthenticationMethodByEmail } from '../../../../lib/domain/usecases/add-pix-authentication-method-by-email.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | add-pix-authentication-method-by-email', function () {
  let userRepository, authenticationMethodRepository;
  let passwordGenerator;
  let cryptoService;

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
    };
    authenticationMethodRepository = {
      hasIdentityProviderPIX: sinon.stub(),
      create: sinon.stub(),
    };
    passwordGenerator = {
      generateComplexPassword: sinon.stub(),
    };
    cryptoService = {
      hashPassword: sinon.stub(),
    };
  });

  it('should check if email is available', async function () {
    // given
    const email = 'newEmail@example.net';
    const generatedPassword = 'Pix12345';
    const hashedPassword = 'ABCDEF123';
    const user = domainBuilder.buildUser({});
    domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

    passwordGenerator.generateComplexPassword.returns(generatedPassword);
    cryptoService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethodByEmail({
      userId: user.id,
      email,
      passwordGenerator,
      cryptoService,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(userRepository.checkIfEmailIsAvailable).to.be.calledWith(email);
  });

  context('when user have not a Pix authentication method', function () {
    it('should add Pix authentication method', async function () {
      // given
      const email = 'newEmail@example.net';
      const generatedPassword = 'Pix12345';
      const hashedPassword = 'ABCDEF123';
      const user = domainBuilder.buildUser({});
      domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

      passwordGenerator.generateComplexPassword.returns(generatedPassword);
      cryptoService.hashPassword.withArgs(generatedPassword).resolves(hashedPassword);

      // when
      await addPixAuthenticationMethodByEmail({
        userId: user.id,
        email,
        passwordGenerator,
        cryptoService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      const authenticationMethodFromPix = new AuthenticationMethod({
        userId: user.id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
        authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
          password: hashedPassword,
          shouldChangePassword: false,
        }),
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
        authenticationMethod: authenticationMethodFromPix,
      });
    });
  });

  it('should update user with new email', async function () {
    // given
    const email = 'newEmail@example.net';
    const generatedPassword = 'Pix12345';
    const hashedPassword = 'ABCDEF123';
    const user = domainBuilder.buildUser({ cgu: true });
    domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

    passwordGenerator.generateComplexPassword.returns(generatedPassword);
    cryptoService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethodByEmail({
      userId: user.id,
      email,
      passwordGenerator,
      cryptoService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly({
      id: user.id,
      userAttributes: { email },
    });
  });
});
