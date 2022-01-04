const { domainBuilder, expect, sinon } = require('../../../test-helper');
const addPixAuthenticationMethodByEmail = require('../../../../lib/domain/usecases/add-pix-authentication-method-by-email');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | UseCase | add-pix-authentication-method-by-email', function () {
  let userRepository, authenticationMethodRepository;
  let passwordGenerator;
  let encryptionService;

  beforeEach(function () {
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
      get: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
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
    userRepository.get.withArgs(user.id).resolves(user);

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
      userRepository.get.withArgs(user.id).resolves(user);

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

    context('when user had to validate cgu', function () {
      it('should update mustValidateTermsOfService', async function () {
        // given
        const email = 'newEmail@example.net';
        const generatedPassword = 'Pix12345';
        const hashedPassword = 'ABCDEF123';
        const user = domainBuilder.buildUser({ cgu: false });
        domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

        passwordGenerator.generateComplexPassword.returns(generatedPassword);
        encryptionService.hashPassword.resolves(hashedPassword);
        userRepository.get.withArgs(user.id).resolves(user);

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
        const expectedAttributes = { email, mustValidateTermsOfService: true };
        expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith(user.id, expectedAttributes);
      });
    });

    context('when user has validate cgu', function () {
      it('should not update mustValidateTermsOfService', async function () {
        // given
        const email = 'newEmail@example.net';
        const generatedPassword = 'Pix12345';
        const hashedPassword = 'ABCDEF123';
        const user = domainBuilder.buildUser({ cgu: true });
        domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

        passwordGenerator.generateComplexPassword.returns(generatedPassword);
        encryptionService.hashPassword.resolves(hashedPassword);
        userRepository.get.withArgs(user.id).resolves(user);

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
        expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith(user.id, { email });
      });
    });
  });
});
