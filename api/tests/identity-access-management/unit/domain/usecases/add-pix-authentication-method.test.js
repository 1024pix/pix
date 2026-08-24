import sinon from 'sinon';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { addPixAuthenticationMethod } from '../../../../../src/identity-access-management/domain/usecases/add-pix-authentication-method.usecase.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Domain | UseCase | add-pix-authentication-method', function () {
  let userRepository, authenticationMethodRepository;
  let passwordGeneratorService;
  let cryptoService;

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
    };
    authenticationMethodRepository = {
      hasIdentityProviderPIX: sinon.stub(),
      create: sinon.stub(),
    };
    passwordGeneratorService = {
      generateComplexPassword: sinon.stub(),
    };
    cryptoService = {
      hashPassword: sinon.stub(),
    };
  });

  it('checks if email is available', async function () {
    // given
    const email = 'newEmail@example.net';
    const generatedPassword = 'Pix12345';
    const hashedPassword = 'ABCDEF123';
    const user = domainBuilder.buildUser({});
    domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

    passwordGeneratorService.generateComplexPassword.returns(generatedPassword);
    cryptoService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethod({
      userId: user.id,
      email,
      passwordGeneratorService,
      cryptoService,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(userRepository.checkIfEmailIsAvailable).to.be.calledWith(email);
  });

  context('when user have not a Pix authentication method', function () {
    it('adds Pix authentication method', async function () {
      // given
      const email = 'newEmail@example.net';
      const generatedPassword = 'Pix12345';
      const hashedPassword = 'ABCDEF123';
      const user = domainBuilder.buildUser({});
      domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

      passwordGeneratorService.generateComplexPassword.returns(generatedPassword);
      cryptoService.hashPassword.withArgs(generatedPassword).resolves(hashedPassword);

      // when
      await addPixAuthenticationMethod({
        userId: user.id,
        email,
        passwordGeneratorService,
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

  it('updates user with new email', async function () {
    // given
    const email = 'newEmail@example.net';
    const generatedPassword = 'Pix12345';
    const hashedPassword = 'ABCDEF123';
    const user = domainBuilder.buildUser({ cgu: true });
    domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

    passwordGeneratorService.generateComplexPassword.returns(generatedPassword);
    cryptoService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethod({
      userId: user.id,
      email,
      passwordGeneratorService,
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
