const { domainBuilder, expect, sinon } = require('../../../test-helper');
const createUserAndReconcileToSchoolingRegistrationFromExternalUser = require('../../../../lib/domain/usecases/create-user-and-reconcile-to-schooling-registration-from-external-user');

describe('Unit | UseCase | create-user-and-reconcile-to-schooling-registration-from-external-user', function () {
  let obfuscationService;
  let tokenService;
  let userReconciliationService;
  let userService;
  let authenticationMethodRepository;
  let campaignRepository;
  let userRepository;
  let schoolingRegistrationRepository;
  let studentRepository;

  beforeEach(function () {
    campaignRepository = {
      getByCode: sinon.stub(),
    };
    tokenService = {
      extractExternalUserFromIdToken: sinon.stub(),
      createAccessTokenForSaml: sinon.stub(),
    };
    userReconciliationService = {
      findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser: sinon.stub(),
      checkIfStudentHasAnAlreadyReconciledAccount: sinon.stub(),
    };
    userRepository = {
      getBySamlId: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };
    userService = {
      createAndReconcileUserToSchoolingRegistration: sinon.stub(),
    };
  });

  context('when user has saml id', function () {
    it('should save last login date', async function () {
      // given
      const user = domainBuilder.buildUser();
      const schoolingRegistration = domainBuilder.buildSchoolingRegistration(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(
        schoolingRegistration
      );
      userRepository.getBySamlId.resolves(user);

      // when
      await createUserAndReconcileToSchoolingRegistrationFromExternalUser({
        birthdate: user.birthdate,
        campaignCode: 'ABCDE',
        token: 'a token',
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        schoolingRegistrationRepository,
        studentRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: user.id });
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const schoolingRegistration = domainBuilder.buildSchoolingRegistration(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(
        schoolingRegistration
      );
      userRepository.getBySamlId.resolves(user);
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(token);

      // when
      const result = await createUserAndReconcileToSchoolingRegistrationFromExternalUser({
        birthdate: user.birthdate,
        campaignCode: 'ABCDE',
        token: 'a token',
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        schoolingRegistrationRepository,
        studentRepository,
      });

      // then
      expect(result).to.equal(token);
    });
  });

  context('when user does not have saml id', function () {
    it('should save last login date', async function () {
      // given
      const user = domainBuilder.buildUser();
      const schoolingRegistration = domainBuilder.buildSchoolingRegistration(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(
        schoolingRegistration
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToSchoolingRegistration.resolves(user.id);

      // when
      await createUserAndReconcileToSchoolingRegistrationFromExternalUser({
        birthdate: user.birthdate,
        campaignCode: 'ABCDE',
        token: 'a token',
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        schoolingRegistrationRepository,
        studentRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: user.id });
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const schoolingRegistration = domainBuilder.buildSchoolingRegistration(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser.resolves(
        schoolingRegistration
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToSchoolingRegistration.resolves(user.id);
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(token);

      // when
      const result = await createUserAndReconcileToSchoolingRegistrationFromExternalUser({
        birthdate: user.birthdate,
        campaignCode: 'ABCDE',
        token: 'a token',
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        schoolingRegistrationRepository,
        studentRepository,
      });

      // then
      expect(result).to.equal(token);
    });
  });
});
