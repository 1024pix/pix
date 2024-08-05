import {
  OrganizationLearnerDoesAlreadyHaveAnUsernameError,
  OrganizationLearnerDoesNotBelongToOrganizationError,
  OrganizationLearnerDoesNotHaveAPixAccountError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { generateUsernames } from '../../../../../src/identity-access-management/domain/usecases/generate-usernames.usecase.js';
import { OrganizationLearnerPasswordResetDTO } from '../../../../../src/shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | Generate Usernames', function () {
  const generatedPassword = 'Pix12345';
  const expectedUsername1 = 'simone.biles2024';
  const expectedUsername2 = 'rebeca.andrade2024';

  let passwordGeneratorService,
    cryptoService,
    userReconciliationService,
    userService,
    authenticationMethodRepository,
    userRepository,
    organizationLearnerRepository;

  beforeEach(function () {
    passwordGeneratorService = {
      generateSimplePassword: sinon.stub().returns(generatedPassword),
    };
    cryptoService = {
      hashPassword: sinon.stub(),
    };
    userReconciliationService = {
      createUsernameByUser: sinon.stub(),
    };
    userService = {
      updateUsernameAndAddPassword: sinon.stub(),
    };
    authenticationMethodRepository = {
      hasIdentityProviderPIX: sinon.stub(),
    };
    userRepository = {
      updateUsername: sinon.stub(),
    };
    organizationLearnerRepository = {
      findByIds: sinon.stub(),
    };
  });

  context('when a list of organization learners with an authentication method "Pix" is provided', function () {
    it('creates usernames for all students', async function () {
      // given
      const organizationId = 1;
      const usersIds = ['1', '2'];
      const organizationLearnerIds = ['11', '22'];
      const organizationLearners = [
        {
          id: organizationLearnerIds[0],
          organizationId,
          userId: usersIds[0],
          division: '5G',
          firstName: 'Simone',
          lastName: 'Biles',
        },
        {
          id: organizationLearnerIds[1],
          organizationId,
          userId: usersIds[1],
          division: '3A',
          firstName: 'Rebeca',
          lastName: 'Andrade',
        },
      ];
      const users = [
        { id: usersIds[0], username: '' },
        { id: usersIds[1], username: '' },
      ];

      organizationLearnerRepository.findByIds.resolves(organizationLearners);
      userRepository.getByIds = sinon.stub().resolves(users);
      authenticationMethodRepository.hasIdentityProviderPIX.resolves(true);
      userReconciliationService.createUsernameByUser
        .onFirstCall()
        .resolves(expectedUsername1)
        .onSecondCall()
        .resolves(expectedUsername2);

      // when
      const result = await generateUsernames({
        organizationLearnerIds,
        organizationId,
        passwordGeneratorService,
        cryptoService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        organizationLearnerRepository,
      });

      // then
      expect(organizationLearnerRepository.findByIds).to.have.been.calledWithExactly({ ids: organizationLearnerIds });
      expect(userRepository.getByIds).to.have.been.calledWithExactly(usersIds);
      expect(userReconciliationService.createUsernameByUser).to.have.been.calledTwice;
      expect(authenticationMethodRepository.hasIdentityProviderPIX).to.have.been.calledTwice;
      expect(
        userRepository.updateUsername.withArgs({
          id: organizationLearners[0].userId,
          username: expectedUsername1,
        }),
      ).to.have.been.calledOnce;
      expect(
        userRepository.updateUsername.withArgs({
          id: organizationLearners[1].userId,
          username: expectedUsername2,
        }),
      ).to.have.been.calledOnce;
      expect(result).to.deepEqualArray([
        new OrganizationLearnerPasswordResetDTO({
          username: expectedUsername1,
          division: '5G',
          firstName: 'Simone',
          lastName: 'Biles',
          password: '',
        }),
        new OrganizationLearnerPasswordResetDTO({
          username: expectedUsername2,
          division: '3A',
          firstName: 'Rebeca',
          lastName: 'Andrade',
          password: '',
        }),
      ]);
    });
  });

  context(
    'when a list of organization learners with an authentication method other than "pix" is provided',
    function () {
      it('creates usernames and temporary passwords', async function () {
        // given
        const organizationId = 1;
        const usersIds = ['1', '2'];
        const organizationLearnerIds = ['11', '22'];
        const organizationLearners = [
          {
            id: organizationLearnerIds[0],
            organizationId,
            userId: usersIds[0],
            division: '3B',
            firstName: 'Simone',
            lastName: 'Biles',
          },
          {
            id: organizationLearnerIds[1],
            organizationId,
            userId: usersIds[1],
            division: '3B',
            firstName: 'Rebeca',
            lastName: 'Andrade',
          },
        ];
        const users = [
          { id: usersIds[0], username: '' },
          { id: usersIds[1], username: '' },
        ];

        organizationLearnerRepository.findByIds.resolves(organizationLearners);
        userRepository.getByIds = sinon.stub().resolves(users);
        authenticationMethodRepository.hasIdentityProviderPIX.resolves(false);
        userReconciliationService.createUsernameByUser
          .onFirstCall()
          .resolves(expectedUsername1)
          .onSecondCall()
          .resolves(expectedUsername2);

        // when
        const result = await generateUsernames({
          organizationLearnerIds,
          organizationId,
          passwordGeneratorService,
          cryptoService,
          userReconciliationService,
          userService,
          authenticationMethodRepository,
          userRepository,
          organizationLearnerRepository,
        });

        // then
        expect(organizationLearnerRepository.findByIds).to.have.been.calledWithExactly({ ids: organizationLearnerIds });
        expect(userRepository.getByIds).to.have.been.calledWithExactly(usersIds);
        expect(userReconciliationService.createUsernameByUser).to.have.been.calledTwice;
        expect(authenticationMethodRepository.hasIdentityProviderPIX).to.have.been.calledTwice;
        expect(passwordGeneratorService.generateSimplePassword).to.have.been.calledTwice;
        expect(cryptoService.hashPassword).to.have.been.calledWithExactly(generatedPassword);
        expect(cryptoService.hashPassword).to.have.been.calledTwice;
        expect(userService.updateUsernameAndAddPassword).to.have.been.calledTwice;
        expect(result).to.deepEqualArray([
          new OrganizationLearnerPasswordResetDTO({
            username: expectedUsername1,
            password: generatedPassword,
            division: '3B',
            firstName: 'Simone',
            lastName: 'Biles',
          }),
          new OrganizationLearnerPasswordResetDTO({
            username: expectedUsername2,
            password: generatedPassword,
            division: '3B',
            firstName: 'Rebeca',
            lastName: 'Andrade',
          }),
        ]);
      });
    },
  );

  context("when an organization learner doesn't have a pix account", function () {
    it('throws an OrganizationLearnerDoesNotHaveAPixAccountError', async function () {
      // given
      const organizationId = 1;
      const usersIds = ['1'];
      const organizationLearnerIds = ['11', '22'];
      const organizationLearners = [
        { id: organizationLearnerIds[0], organizationId, userId: usersIds[0], division: '3B' },
        { id: organizationLearnerIds[1], organizationId, userId: null, division: '3B' },
      ];
      const users = [{ id: usersIds[0], username: '' }];

      organizationLearnerRepository.findByIds.resolves(organizationLearners);
      userRepository.getByIds = sinon.stub().resolves(users);

      // when
      const error = await catchErr(generateUsernames)({
        organizationLearnerIds,
        organizationId,
        passwordGeneratorService,
        cryptoService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        organizationLearnerRepository,
      });

      // then
      expect(error).to.be.instanceOf(OrganizationLearnerDoesNotHaveAPixAccountError);
    });
  });

  context("when an organization learner doesn't belong to organization", function () {
    it('throws an OrganizationLearnerDoesNotBelongToOrganizationError', async function () {
      // given
      const organizationId = 1;
      const usersIds = ['1', '2'];
      const organizationLearnerIds = ['11', '22'];
      const organizationLearners = [
        { id: organizationLearnerIds[0], organizationId, userId: usersIds[0], division: '3B' },
        { id: organizationLearnerIds[1], organizationId: 2, userId: usersIds[1], division: '3B' },
      ];

      organizationLearnerRepository.findByIds.resolves(organizationLearners);

      // when
      const error = await catchErr(generateUsernames)({
        organizationLearnerIds,
        organizationId,
        passwordGeneratorService,
        cryptoService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        organizationLearnerRepository,
      });

      // then
      expect(organizationLearnerRepository.findByIds).to.have.been.calledWithExactly({ ids: organizationLearnerIds });
      expect(error).to.be.instanceOf(OrganizationLearnerDoesNotBelongToOrganizationError);
    });
  });

  context('when organization learner has an username', function () {
    it('throws an OrganizationLearnerDoesAlreadyHaveAnUsernameError', async function () {
      // given
      const organizationId = 1;
      const usersIds = ['1', '2'];
      const organizationLearnerIds = ['11', '22'];
      const organizationLearners = [
        { id: organizationLearnerIds[0], organizationId, userId: usersIds[0], division: '3B' },
        { id: organizationLearnerIds[1], organizationId, userId: usersIds[1], division: '3B' },
      ];
      const users = [
        { id: usersIds[0], username: 'SunisaLee2024' },
        { id: usersIds[1], username: 'KayliaNeymour2024' },
      ];

      organizationLearnerRepository.findByIds.resolves(organizationLearners);
      userRepository.getByIds = sinon.stub().resolves(users);

      // when
      const error = await catchErr(generateUsernames)({
        organizationLearnerIds,
        organizationId,
        passwordGeneratorService,
        cryptoService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        userRepository,
        organizationLearnerRepository,
      });

      // then
      expect(organizationLearnerRepository.findByIds).to.have.been.calledWithExactly({ ids: organizationLearnerIds });
      expect(userRepository.getByIds).to.have.been.calledWithExactly(usersIds);
      expect(error).to.be.instanceOf(OrganizationLearnerDoesAlreadyHaveAnUsernameError);
    });
  });
});
