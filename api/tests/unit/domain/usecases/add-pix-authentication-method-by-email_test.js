import { domainBuilder, expect, sinon } from '../../../test-helper';
import addPixAuthenticationMethodByEmail from '../../../../lib/domain/usecases/add-pix-authentication-method-by-email';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';

describe('Unit | UseCase | add-pix-authentication-method-by-email', function () {
  let userRepository, authenticationMethodRepository;
  let passwordGenerator;
  let encryptionService;

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
    encryptionService = {
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
    encryptionService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethodByEmail({
      userId: user.id,
      email,
      passwordGenerator,
      encryptionService,
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
      encryptionService.hashPassword.withArgs(generatedPassword).resolves(hashedPassword);

      // when
      await addPixAuthenticationMethodByEmail({
        userId: user.id,
        email,
        passwordGenerator,
        encryptionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      const authenticationMethodFromPix = new AuthenticationMethod({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
          password: hashedPassword,
          shouldChangePassword: false,
        }),
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
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
    encryptionService.hashPassword.resolves(hashedPassword);

    // when
    await addPixAuthenticationMethodByEmail({
      userId: user.id,
      email,
      passwordGenerator,
      encryptionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith({
      id: user.id,
      userAttributes: { email },
    });
  });
});
