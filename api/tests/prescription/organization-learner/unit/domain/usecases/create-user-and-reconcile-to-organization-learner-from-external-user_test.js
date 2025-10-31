import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { UserAccessToken } from '../../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../../../../../../src/identity-access-management/domain/models/UserReconciliationSamlIdToken.js';
import { RequestedApplication } from '../../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { createUserAndReconcileToOrganizationLearnerFromExternalUser } from '../../../../../../src/prescription/organization-learner/domain/usecases/create-user-and-reconcile-to-organization-learner-from-external-user.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | create-user-and-reconcile-to-organization-learner-from-external-user', function () {
  const organizationId = 1;
  let obfuscationService;
  let userReconciliationService;
  let userService;
  let authenticationMethodRepository;
  let userRepository;
  let userLoginRepository;
  let organizationLearnerRepository;
  let studentRepository;
  let lastUserApplicationConnectionsRepository;
  const audience = 'https://app.pix.fr';
  const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.fr' });

  beforeEach(function () {
    userReconciliationService = {
      findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo: sinon.stub(),
      assertStudentHasAnAlreadyReconciledAccount: sinon.stub(),
    };
    userRepository = {
      getBySamlId: sinon.stub(),
    };
    userLoginRepository = {
      updateLastLoggedAt: sinon.stub(),
    };
    userService = {
      createAndReconcileUserToOrganizationLearner: sinon.stub(),
    };

    authenticationMethodRepository = {
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };

    lastUserApplicationConnectionsRepository = {
      upsert: sinon.stub(),
    };
  });

  context('when user has saml id', function () {
    it('should save last login date', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      sinon.stub(UserReconciliationSamlIdToken, 'decode').returns(externalUser);

      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(user);

      // when
      await createUserAndReconcileToOrganizationLearnerFromExternalUser({
        birthdate: user.birthdate,
        organizationId,
        token: 'a token',
        obfuscationService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        organizationLearnerRepository,
        studentRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
      expect(lastUserApplicationConnectionsRepository.upsert).to.have.been.calledWithExactly({
        userId: user.id,
        application: requestedApplication.applicationName,
        lastLoggedAt: sinon.match.date,
      });
      expect(authenticationMethodRepository.updateLastLoggedAtByIdentityProvider).to.have.been.calledWithExactly({
        userId: user.id,
        identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      sinon.stub(UserReconciliationSamlIdToken, 'decode').returns(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(user);

      sinon
        .stub(UserAccessToken, 'generateSamlUserToken')
        .withArgs({ userId: user.id, audience })
        .returns({ accessToken: token });

      // when
      const result = await createUserAndReconcileToOrganizationLearnerFromExternalUser({
        birthdate: user.birthdate,
        organizationId,
        token: 'a token',
        obfuscationService,
        audience,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        organizationLearnerRepository,
        studentRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(result).to.equal(token);
    });
  });

  context('when user does not have saml id', function () {
    it('should save last login dates', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };

      sinon.stub(UserReconciliationSamlIdToken, 'decode').returns(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToOrganizationLearner.resolves(user.id);

      // when
      await createUserAndReconcileToOrganizationLearnerFromExternalUser({
        birthdate: user.birthdate,
        organizationId,
        token: 'a token',
        obfuscationService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        organizationLearnerRepository,
        studentRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
    });

    it('should return an access token', async function () {
      // given
      const user = domainBuilder.buildUser();
      const organizationLearner = domainBuilder.buildOrganizationLearner(user);
      const externalUser = { firstName: user.firstName, lastName: user.lastName, samlId: '123' };
      const token = Symbol('token');

      sinon.stub(UserReconciliationSamlIdToken, 'decode').returns(externalUser);
      userReconciliationService.findMatchingOrganizationLearnerForGivenOrganizationIdAndReconciliationInfo.resolves(
        organizationLearner,
      );
      userRepository.getBySamlId.resolves(null);
      userService.createAndReconcileUserToOrganizationLearner.resolves(user.id);

      sinon
        .stub(UserAccessToken, 'generateSamlUserToken')
        .withArgs({ userId: user.id, audience })
        .returns({ accessToken: token });

      // when
      const result = await createUserAndReconcileToOrganizationLearnerFromExternalUser({
        birthdate: user.birthdate,
        organizationId,
        token: 'a token',
        obfuscationService,
        audience,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        organizationLearnerRepository,
        studentRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(result).to.equal(token);
    });
  });
});
