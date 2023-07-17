import { catchErr, expect, sinon } from '../../../test-helper.js';
import { updateOrganizationLearnersPassword } from '../../../../lib/domain/usecases/update-organization-learners-password.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../../lib/domain/errors.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
  USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
} from '../../../../lib/domain/constants/update-organization-learners-password-errors.js';
import { OrganizationLearnerPasswordDTO } from '../../../../lib/domain/models/OrganizationLearnerPasswordDTO.js';

describe('Unit | UseCases | Update organization learners password', function () {
  const hashedPassword = '21fedcba';
  const generatedPassword = 'abcdef12';

  let authenticationMethodRepository,
    organizationLearnerRepository,
    userRepository,
    encryptionService,
    passwordGenerator;

  beforeEach(function () {
    authenticationMethodRepository = {};
    organizationLearnerRepository = {};
    userRepository = {};
    encryptionService = { hashPassword: sinon.stub().resolves(hashedPassword) };
    passwordGenerator = { generateSimplePassword: sinon.stub().returns(generatedPassword) };
  });

  context('success', function () {
    context(
      'when a list of organization learners with an authentication method "identifiant" is provided',
      function () {
        it('updates organization learners passwords and returns organization learners with their generated password', async function () {
          // given
          const studentIds = ['3', '4'];
          const organizationId = 1;
          const organizationLearnersId = [
            { organizationId: 1, userId: studentIds[0], division: '3B' },
            { organizationId: 1, userId: studentIds[1], division: '3B' },
          ];
          const userId = 2;
          const userWithMemberships = { id: 2, hasAccessToOrganization: sinon.stub().returns(true) };
          const users = [
            { id: studentIds[0], username: 'Paul' },
            { id: studentIds[1], username: 'Jacques' },
          ];
          const userIdHashedPassword = [
            { userId: studentIds[0], hashedPassword },
            { userId: studentIds[1], hashedPassword },
          ];
          const domainTransaction = Symbol('transaction');

          organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
          userRepository.getWithMemberships = sinon.stub().resolves(userWithMemberships);
          userRepository.getByIds = sinon.stub().resolves(users);
          authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged = sinon.stub().resolves();

          // when
          const organizationLearnersGeneratedPassword = await updateOrganizationLearnersPassword({
            organizationId,
            organizationLearnersId,
            userId,
            domainTransaction,
            authenticationMethodRepository,
            organizationLearnerRepository,
            userRepository,
            encryptionService,
            passwordGenerator,
          });

          // then
          expect(passwordGenerator.generateSimplePassword).to.have.been.callCount(2);
          expect(encryptionService.hashPassword).to.have.been.calledWith(generatedPassword);
          expect(encryptionService.hashPassword).to.have.been.callCount(2);
          expect(authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged).to.have.been.calledWith({
            usersToUpdateWithNewPassword: userIdHashedPassword,
            domainTransaction,
          });
          expect(organizationLearnersGeneratedPassword).to.have.deep.members([
            new OrganizationLearnerPasswordDTO({
              username: 'Paul',
              password: generatedPassword,
              division: '3B',
            }),
            new OrganizationLearnerPasswordDTO({
              username: 'Jacques',
              password: generatedPassword,
              division: '3B',
            }),
          ]);
        });
      }
    );
  });

  context('failure', function () {
    context('when user does not belong to organization', function () {
      it('throws an UserNotAuthorizedToUpdatePasswordError', async function () {
        // given
        const organizationId = 1;
        const organizationLearnersId = [];
        const userId = 2;
        const userWithMemberships = { id: 2, hasAccessToOrganization: sinon.stub().returns(false) };

        organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
        userRepository.getWithMemberships = sinon.stub().resolves(userWithMemberships);

        // when
        const error = await catchErr(updateOrganizationLearnersPassword)({
          organizationId,
          organizationLearnersId,
          userId,
          organizationLearnerRepository,
          userRepository,
        });

        // then
        expect(organizationLearnerRepository.findByIds).to.have.been.calledWith({ ids: organizationLearnersId });
        expect(userRepository.getWithMemberships).to.have.been.calledWith(userId);
        expect(userWithMemberships.hasAccessToOrganization).to.have.been.calledWith(organizationId);
        expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
        expect(error.code).to.equal(USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE);
      });
    });

    context('when an organization learner does not belong to organization', function () {
      it('throws an UserNotAuthorizedToUpdatePasswordError', async function () {
        // given
        const organizationId = 1;
        const organizationLearnersId = [{ organizationId: 1 }, { organizationId: 2 }];
        const userId = 2;
        const userWithMemberships = { id: 2, hasAccessToOrganization: sinon.stub().returns(true) };

        organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
        userRepository.getWithMemberships = sinon.stub().resolves(userWithMemberships);

        // when
        const error = await catchErr(updateOrganizationLearnersPassword)({
          organizationId,
          organizationLearnersId,
          userId,
          organizationLearnerRepository,
          userRepository,
        });

        // then
        expect(organizationLearnerRepository.findByIds).to.have.been.calledWith({ ids: organizationLearnersId });
        expect(userRepository.getWithMemberships).to.have.been.calledWith(userId);
        expect(userWithMemberships.hasAccessToOrganization).to.have.been.calledWith(organizationId);
        expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
        expect(error.code).to.equal(ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE);
      });
    });

    context('when organization learner does not have an username', function () {
      it('throws an UserNotAuthorizedToUpdatePasswordError with code "ORGANIZATION_LEARNER_WITHOUT_USERNAME"', async function () {
        // given
        const studentIds = ['3', '4'];
        const organizationId = 1;
        const organizationLearnersId = [
          { organizationId: 1, userId: studentIds[0] },
          { organizationId: 1, userId: studentIds[1] },
        ];
        const userId = 2;
        const userWithMemberships = { id: 2, hasAccessToOrganization: sinon.stub().returns(true) };
        const users = [{ id: studentIds[0], username: 'Paul' }, { id: studentIds[1] }];

        organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
        userRepository.getWithMemberships = sinon.stub().resolves(userWithMemberships);
        userRepository.getByIds = sinon.stub().resolves(users);

        // when
        const error = await catchErr(updateOrganizationLearnersPassword)({
          organizationId,
          organizationLearnersId,
          userId,
          organizationLearnerRepository,
          userRepository,
        });
        // then
        expect(userRepository.getByIds).to.have.been.calledWith(studentIds);
        expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
        expect(error.code).to.equal(ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
      });
    });
  });
});
