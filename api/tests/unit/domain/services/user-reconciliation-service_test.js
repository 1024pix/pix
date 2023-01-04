const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const {
  AlreadyRegisteredUsernameError,
  NotFoundError,
  OrganizationLearnerAlreadyLinkedToUserError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
} = require('../../../../lib/domain/errors');

describe('Unit | Service | user-reconciliation-service', function () {
  let organizationLearners;

  beforeEach(function () {
    organizationLearners = [
      domainBuilder.buildOrganizationLearner({
        firstName: 'firstName',
        middleName: 'middleName',
        thirdName: 'thirdName',
        lastName: 'lastName',
        preferredLastName: 'preferredLastName',
      }),
      domainBuilder.buildOrganizationLearner({
        firstName: 'secondLearner_firstName',
        middleName: 'secondLearner_middleName',
        thirdName: 'secondLearner_thirdName',
        lastName: 'secondLearner_lastName',
        preferredLastName: 'secondLearner_preferredLastName',
      }),
    ];
  });

  describe('#findMatchingCandidateIdForGivenUser', function () {
    const user = {
      firstName: 'Joe',
      lastName: 'Poe',
    };

    context('When organizationLearner list is empty', function () {
      it('should return null', async function () {
        // when
        const result = await userReconciliationService.findMatchingCandidateIdForGivenUser([], user);

        // then
        expect(result).to.equal(null);
      });
    });

    context('When organizationLearner list is not empty', function () {
      context('When no organizationLearner matched on names', function () {
        it('should return null if name is completely different', async function () {
          // given
          user.firstName = 'Sam';

          organizationLearners[0].firstName = 'Joe';
          organizationLearners[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
            organizationLearners,
            user
          );

          // then
          expect(result).to.equal(null);
        });

        it('should return null if name is not close enough', async function () {
          // given
          user.firstName = 'Frédérique';

          organizationLearners[0].firstName = 'Frédéric';
          organizationLearners[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
            organizationLearners,
            user
          );

          // then
          expect(result).to.equal(null);
        });
      });

      // A contained context state 'When multiple matches'
      // So the context 'one organizationLearner matched' is ambiguous
      // Can it be replaced by 'When at least one organizationLearner matched on names' ?
      context('When one organizationLearner matched on names', function () {
        context('When organizationLearner found based on his...', function () {
          it('...firstName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...middleName', async function () {
            // given
            organizationLearners[0].middleName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...thirdName', async function () {
            // given
            organizationLearners[0].thirdName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...lastName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...preferredLastName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...firstName with empty middleName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].middleName = null;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...preferredLastName with empty lastName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].preferredLastName = user.lastName;
            organizationLearners[0].lastName = null;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...lastName with empty preferredLastName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].preferredLastName = null;
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });
        });

        context('When organizationLearner found even if there is...', function () {
          it('...an accent', async function () {
            // given
            user.firstName = 'Joé';

            organizationLearners[0].firstName = 'Joe';
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...a white space', async function () {
            // given
            user.firstName = 'Jo e';

            organizationLearners[0].firstName = 'Joe';
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...a special character', async function () {
            // given
            user.firstName = 'Jo~e';

            organizationLearners[0].firstName = 'Joe';
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });

          it('...a mistake', async function () {
            // given
            user.firstName = 'Joey';

            organizationLearners[0].firstName = 'Joe';
            organizationLearners[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });
        });

        context('When multiple matches', function () {
          it('should prefer firstName over middleName', async function () {
            // given
            organizationLearners[0].middleName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            organizationLearners[1].firstName = user.firstName;
            organizationLearners[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[1].id);
          });

          it('should prefer middleName over thirdName', async function () {
            // given
            organizationLearners[0].thirdName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            organizationLearners[1].middleName = user.firstName;
            organizationLearners[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(organizationLearners[1].id);
          });

          it('should prefer nobody with same lastName and preferredLastName', async function () {
            // given
            organizationLearners[0].firstName = user.firstName;
            organizationLearners[0].lastName = user.lastName;

            organizationLearners[1].firstName = user.firstName;
            organizationLearners[1].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              user
            );

            // then
            expect(result).to.equal(null);
          });
        });

        context('When two organizationLearners are close', function () {
          const twin1 = { firstName: 'allan', lastName: 'Poe' };
          const twin2 = { firstName: 'alian', lastName: 'Poe' };

          it('should prefer the firstName that match perfectly', async function () {
            // given
            organizationLearners[0].firstName = twin1.firstName;
            organizationLearners[0].lastName = twin1.lastName;
            organizationLearners[1].firstName = twin2.firstName;
            organizationLearners[1].lastName = twin2.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(
              organizationLearners,
              twin1
            );

            // then
            expect(result).to.equal(organizationLearners[0].id);
          });
        });
      });
    });
  });

  describe('#findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser', function () {
    let user;
    let organizationId;
    let organizationLearnerRepositoryStub;

    beforeEach(function () {
      organizationId = domainBuilder.buildOrganization().id;
      organizationLearnerRepositoryStub = {
        findByOrganizationIdAndBirthdate: sinon.stub(),
      };
    });

    context('When organization Learners are found for organization and birthdate', function () {
      beforeEach(function () {
        organizationLearnerRepositoryStub.findByOrganizationIdAndBirthdate.resolves(organizationLearners);
      });

      context('When no organization Learners matched on names', function () {
        it('should throw NotFoundError', async function () {
          // given
          user = {
            firstName: 'fakeFirstName',
            lastName: 'fakeLastName',
          };

          // when
          const result = await catchErr(
            userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser
          )({
            organizationId,
            reconciliationInfo: user,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
          });

          // then
          expect(result).to.be.instanceOf(NotFoundError);
          expect(result.message).to.equal('There were no organizationLearners matching with names');
        });
      });

      context('When one organization learner matched on names', function () {
        beforeEach(function () {
          user = {
            firstName: organizationLearners[0].firstName,
            lastName: organizationLearners[0].lastName,
          };
        });

        it('should return matched OrganizationLearner', async function () {
          // when
          const result = await userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser(
            {
              organizationId,
              reconciliationInfo: user,
              organizationLearnerRepository: organizationLearnerRepositoryStub,
            }
          );

          // then
          expect(result).to.equal(organizationLearners[0]);
        });
      });
    });

    context('When no organization Learners found', function () {
      beforeEach(function () {
        organizationLearnerRepositoryStub.findByOrganizationIdAndBirthdate.resolves([]);
      });

      it('should throw NotFoundError', async function () {
        // given
        user = {
          firstName: 'fakeFirstName',
          lastName: 'fakeLastName',
        };

        // when
        const result = await catchErr(
          userReconciliationService.findMatchingOrganizationLearnerIdForGivenOrganizationIdAndUser
        )({
          organizationId,
          reconciliationInfo: user,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
        });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
        expect(result.message).to.equal('There are no organization learners found');
      });
    });
  });

  describe('#findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser', function () {
    let user;
    let organizationId;
    let supOrganizationLearnerRepositoryStub;

    beforeEach(function () {
      organizationId = domainBuilder.buildOrganization().id;
      supOrganizationLearnerRepositoryStub = {
        findOneByStudentNumberAndBirthdate: sinon.stub(),
      };
    });

    context('When organization Learners are found for organization and birthdate', function () {
      beforeEach(function () {
        supOrganizationLearnerRepositoryStub.findOneByStudentNumberAndBirthdate.resolves(organizationLearners[0]);
      });

      context('When no organization Learners matched on names', function () {
        it('should throw an error', async function () {
          // given
          user = {
            firstName: 'fakeFirstName',
            lastName: 'fakeLastName',
          };

          // when
          const error = await catchErr(
            userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser
          )({
            organizationId,
            reconciliationInfo: user,
            supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
        });
      });

      context('When one organization learner matched on names', function () {
        beforeEach(function () {
          user = {
            firstName: organizationLearners[0].firstName,
            lastName: organizationLearners[0].lastName,
          };
        });

        context('When organizationLearner is already linked', function () {
          beforeEach(function () {
            organizationLearners[0].userId = '123';
          });

          it('should throw an error', async function () {
            // given
            supOrganizationLearnerRepositoryStub.findOneByStudentNumberAndBirthdate.resolves(organizationLearners[0]);

            // when
            const result = await catchErr(
              userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser
            )({
              organizationId,
              reconciliationInfo: user,
              supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
            });

            // then
            expect(result).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
          });
        });

        context('When organizationLearner is not already linked', function () {
          it('should return matched OrganizationLearner', async function () {
            // when
            const result =
              await userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser({
                organizationId,
                reconciliationInfo: user,
                supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
              });

            // then
            expect(result).to.equal(organizationLearners[0]);
          });
        });
      });
    });

    context('When no organization Learners found', function () {
      beforeEach(function () {
        supOrganizationLearnerRepositoryStub.findOneByStudentNumberAndBirthdate.resolves(null);
      });

      it('should throw an error', async function () {
        // given
        user = {
          firstName: 'fakeFirstName',
          lastName: 'fakeLastName',
        };

        // when
        const error = await catchErr(
          userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser
        )({
          organizationId,
          reconciliationInfo: user,
          supOrganizationLearnerRepository: supOrganizationLearnerRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#generateUsernameUntilAvailable', function () {
    let userRepository;

    beforeEach(function () {
      userRepository = {
        isUsernameAvailable: sinon.stub(),
      };
    });

    it('should generate a username with original inputs', async function () {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable.resolves();
      const expectedUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({
        firstPart,
        secondPart,
        userRepository,
      });

      // then
      expect(result).to.equal(expectedUsername);
    });

    it('should generate an other username when exist with original inputs', async function () {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable
        .onFirstCall()
        .rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall()
        .resolves();

      const originalUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({
        firstPart,
        secondPart,
        userRepository,
      });

      // then
      expect(result).to.not.equal(originalUsername);
    });
  });

  describe('#createUsernameByUserAndStudentId', function () {
    const user = {
      firstName: 'fakeFirst-Name',
      lastName: 'fake LastName',
      birthdate: '2008-03-01',
    };
    const originaldUsername = 'fakefirstname.fakelastname0103';

    let userRepository;

    beforeEach(function () {
      userRepository = {
        isUsernameAvailable: sinon.stub(),
      };
    });

    it('should generate a username with original user properties', async function () {
      // given
      userRepository.isUsernameAvailable.resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.equal(originaldUsername);
    });

    it('should generate a other username when exist whith original inputs', async function () {
      // given
      userRepository.isUsernameAvailable
        .onFirstCall()
        .rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall()
        .resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.not.equal(originaldUsername);
    });
  });

  describe('#checkIfStudentHasAnAlreadyReconciledAccount', function () {
    let userRepositoryStub;
    let obfuscationServiceStub;
    let studentRepositoryStub;

    beforeEach(function () {
      userRepositoryStub = {
        getForObfuscation: sinon.stub(),
      };
      obfuscationServiceStub = {
        getUserAuthenticationMethodWithObfuscation: sinon.stub(),
      };
      studentRepositoryStub = {
        getReconciledStudentByNationalStudentId: sinon.stub(),
      };
    });

    context('When student is already reconciled in the same organization', function () {
      context('When the reconciled account has an email', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async function () {
          // given
          const organizationLearner = domainBuilder.buildOrganizationLearner();
          const user = domainBuilder.buildUser({ email: 'test@example.net' });
          organizationLearner.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'email',
            value: 't***@example.net',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R31');
          expect(error.meta.value).to.equal('t***@example.net');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a username', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async function () {
          // given
          const organizationLearner = domainBuilder.buildOrganizationLearner();
          const user = domainBuilder.buildUser({ username: 'john.doe0101' });
          organizationLearner.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'username',
            value: 'j***.d***0101',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R32');
          expect(error.meta.value).to.equal('j***.d***0101');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a samlId', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION code', async function () {
          // given
          const organizationLearner = domainBuilder.buildOrganizationLearner();
          const user = domainBuilder.buildUser({ samlId: 'samlId' });
          organizationLearner.userId = user.id;

          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'samlId',
            value: null,
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R33');
          expect(error.meta.value).to.equal(null);
          expect(error.meta.userId).to.equal(user.id);
        });
      });
    });

    context('When student is already reconciled in an other organization', function () {
      context('When the reconciled account as an email', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async function () {
          // given
          const nationalStudentId = 'nationalStudentId';
          const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId });
          const user = domainBuilder.buildUser({ email: 'test@example.net' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId
            .withArgs(nationalStudentId)
            .resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'email',
            value: 't***@example.net',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R11');
          expect(error.meta.value).to.equal('t***@example.net');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a username', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async function () {
          // given
          const nationalStudentId = 'nationalStudentId';
          const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId });
          const user = domainBuilder.buildUser({ username: 'john.doe0101' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId
            .withArgs(nationalStudentId)
            .resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'username',
            value: 'j***.d***0101',
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R12');
          expect(error.meta.value).to.equal('j***.d***0101');
          expect(error.meta.userId).to.equal(user.id);
        });
      });

      context('When the reconciled account as a samlId', function () {
        it('should return a OrganizationLearnerAlreadyLinkedToUserError with ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION code', async function () {
          // given
          const nationalStudentId = 'nationalStudentId';
          const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId });
          const user = domainBuilder.buildUser({ samlId: 'samlId' });

          studentRepositoryStub.getReconciledStudentByNationalStudentId
            .withArgs(nationalStudentId)
            .resolves({ account: { userId: user.id } });
          userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
          obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).returns({
            authenticatedBy: 'samlId',
            value: null,
          });

          // when
          const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
            organizationLearner,
            userRepositoryStub,
            obfuscationServiceStub,
            studentRepositoryStub
          );

          // then
          expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToUserError);
          expect(userRepositoryStub.getForObfuscation).to.have.been.calledWith(user.id);
          expect(error.message).to.equal('Un compte existe déjà pour l‘élève dans un autre établissement.');
          expect(error.code).to.equal('ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION');
          expect(error.meta.shortCode).to.equal('R13');
          expect(error.meta.value).to.equal(null);
          expect(error.meta.userId).to.equal(user.id);
        });
      });
    });

    context('When student has an invalid reconciliation', function () {
      it('should return a OrganizationLearnerAlreadyLinkedToInvalidUserError', async function () {
        // given
        const nationalStudentId = 'nationalStudentId';
        const user = domainBuilder.buildUser({
          email: null,
          username: null,
          authenticationMethods: [],
        });
        const organizationLearner = domainBuilder.buildOrganizationLearner({ nationalStudentId, userId: user.id });

        studentRepositoryStub.getReconciledStudentByNationalStudentId
          .withArgs(nationalStudentId)
          .resolves({ account: { userId: user.id } });
        userRepositoryStub.getForObfuscation.withArgs(user.id).resolves(user);
        obfuscationServiceStub.getUserAuthenticationMethodWithObfuscation.withArgs(user).rejects(new NotFoundError());

        // when
        const error = await catchErr(userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount)(
          organizationLearner,
          userRepositoryStub,
          obfuscationServiceStub,
          studentRepositoryStub
        );

        // then
        expect(error).to.be.instanceof(OrganizationLearnerAlreadyLinkedToInvalidUserError);
        expect(error.message).to.equal('Élève rattaché avec un compte invalide.');
      });
    });
  });
});
