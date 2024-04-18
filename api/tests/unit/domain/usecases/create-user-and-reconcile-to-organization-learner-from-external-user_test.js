import { createUserAndReconcileToOrganizationLearnerFromExternalUser } from '../../../../lib/domain/usecases/create-user-and-reconcile-to-organization-learner-from-external-user.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-user-and-reconcile-to-organization-learner-from-external-user', function () {
  let obfuscationService;
  let tokenService;
  let userReconciliationService;
  let userService;
  let authenticationMethodRepository;
  let campaignRepository;
  let userRepository;
  let userAccountApi;
  let organizationLearnerRepository;
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
      findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo: sinon.stub(),
      assertStudentHasAnAlreadyReconciledAccount: sinon.stub(),
    };
    userRepository = {
      getBySamlId: sinon.stub(),
    };
    userAccountApi = {
      updateUserAccountLastLoggedAtDate: sinon.stub(),
    };
    userService = {
      createAndReconcileUserToOrganizationLearner: sinon.stub(),
    };
  });

  context('when user has saml id', function () {
    it('should save last login date', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(user);

      // when
      await createUserAndReconcileToOrganizationLearnerFromExternalUser({
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
        userAccountApi,
        organizationLearnerRepository,
        studentRepository,
      });

      // then
      expect(userAccountApi.updateUserAccountLastLoggedAtDate).to.have.been.calledWithExactly(user.id);
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(user);
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(token);

      // when
      const result = await createUserAndReconcileToOrganizationLearnerFromExternalUser({
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
        userAccountApi,
        organizationLearnerRepository,
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
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToOrganizationLearner.resolves(user.id);

      // when
      await createUserAndReconcileToOrganizationLearnerFromExternalUser({
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
        userAccountApi,
        organizationLearnerRepository,
        studentRepository,
      });

      // then
      expect(userAccountApi.updateUserAccountLastLoggedAtDate).to.have.been.calledWithExactly(user.id);
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      campaignRepository.getByCode.resolves('ABCDE');
      tokenService.extractExternalUserFromIdToken.resolves(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToOrganizationLearner.resolves(user.id);
      tokenService.createAccessTokenForSaml.withArgs(user.id).resolves(token);

      // when
      const result = await createUserAndReconcileToOrganizationLearnerFromExternalUser({
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
        userAccountApi,
        organizationLearnerRepository,
        studentRepository,
      });

      // then
      expect(result).to.equal(token);
    });
  });
});
