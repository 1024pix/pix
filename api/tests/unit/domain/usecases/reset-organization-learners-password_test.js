import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
} from '../../../../lib/domain/constants/reset-organization-learners-password-errors.js';
import { resetOrganizationLearnersPassword } from '../../../../lib/domain/usecases/reset-organization-learners-password.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../../src/shared/domain/errors.js';
import { OrganizationLearnerPasswordResetDTO } from '../../../../src/shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCases | Reset organization learners password', function () {
  const hashedPassword = '21fedcba';
  const generatedPassword = 'abcdef12';

  let authenticationMethodRepository, organizationLearnerRepository, userRepository, cryptoService, passwordGenerator;

  beforeEach(function () {
    authenticationMethodRepository = {};
    organizationLearnerRepository = {};
    userRepository = {};
    cryptoService = { hashPassword: sinon.stub().resolves(hashedPassword) };
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
          const users = [
            { id: studentIds[0], username: 'Paul' },
            { id: studentIds[1], username: 'Jacques' },
          ];
          const userIdHashedPassword = [
            { userId: studentIds[0], hashedPassword },
            { userId: studentIds[1], hashedPassword },
          ];

          organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
          userRepository.getByIds = sinon.stub().resolves(users);
          authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged = sinon.stub().resolves();

          // when
          const organizationLearnersPasswordResets = await resetOrganizationLearnersPassword({
            organizationId,
            organizationLearnersId,
            userId,
            authenticationMethodRepository,
            organizationLearnerRepository,
            userRepository,
            cryptoService,
            passwordGenerator,
          });

          // then
          expect(passwordGenerator.generateSimplePassword).to.have.been.callCount(2);
          expect(cryptoService.hashPassword).to.have.been.calledWithExactly(generatedPassword);
          expect(cryptoService.hashPassword).to.have.been.callCount(2);
          expect(authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged).to.have.been.calledWithExactly({
            usersToUpdateWithNewPassword: userIdHashedPassword,
          });
          expect(organizationLearnersPasswordResets).to.have.deep.members([
            new OrganizationLearnerPasswordResetDTO({
              username: 'Paul',
              password: generatedPassword,
              division: '3B',
            }),
            new OrganizationLearnerPasswordResetDTO({
              username: 'Jacques',
              password: generatedPassword,
              division: '3B',
            }),
          ]);
        });
      },
    );
  });

  context('failure', function () {
    context('when an organization learner does not belong to organization', function () {
      it('throws an UserNotAuthorizedToUpdatePasswordError', async function () {
        // given
        const organizationId = 1;
        const organizationLearnersId = [{ organizationId: 1 }, { organizationId: 2 }];
        const userId = 2;

        organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);

        // when
        const error = await catchErr(resetOrganizationLearnersPassword)({
          organizationId,
          organizationLearnersId,
          userId,
          organizationLearnerRepository,
          userRepository,
        });

        // then
        expect(organizationLearnerRepository.findByIds).to.have.been.calledWithExactly({ ids: organizationLearnersId });
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
        const users = [{ id: studentIds[0], username: 'Paul' }, { id: studentIds[1] }];

        organizationLearnerRepository.findByIds = sinon.stub().resolves(organizationLearnersId);
        userRepository.getByIds = sinon.stub().resolves(users);

        // when
        const error = await catchErr(resetOrganizationLearnersPassword)({
          organizationId,
          organizationLearnersId,
          userId,
          organizationLearnerRepository,
          userRepository,
        });
        // then
        expect(userRepository.getByIds).to.have.been.calledWithExactly(studentIds);
        expect(error).to.be.instanceOf(UserNotAuthorizedToUpdatePasswordError);
        expect(error.code).to.equal(ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
      });
    });
  });
});
