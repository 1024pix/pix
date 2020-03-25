const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const {
  NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError, AlreadyRegisteredUsernameError
} = require('../../../../lib/domain/errors');

describe('Unit | Service | user-reconciliation-service', () => {

  let schoolingRegistrations;
  let user;

  describe('#findMatchingCandidateIdForGivenUser', () => {
    beforeEach(() => {
      schoolingRegistrations = [
        domainBuilder.buildSchoolingRegistration(),
        domainBuilder.buildSchoolingRegistration(),
      ];
      user = {
        firstName: 'Joe',
        lastName: 'Poe',
      };
    });

    context('When schoolingRegistration list is not empty', () => {

      context('When no schoolingRegistration matched on names', () => {

        it('should return null if name is completely different', async () => {
          // given
          user.firstName = 'Sam';

          schoolingRegistrations[0].firstName = 'Joe';
          schoolingRegistrations[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

          // then
          expect(result).to.equal(null);
        });

        it('should return null if name is not close enough', async () => {
          // given
          user.firstName = 'Frédérique';

          schoolingRegistrations[0].firstName = 'Frédéric';
          schoolingRegistrations[0].lastName = user.lastName;

          // when
          const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

          // then
          expect(result).to.equal(null);
        });

      });

      context('When one schoolingRegistration matched on names', () => {

        context('When schoolingRegistration found based on his...', () => {

          it('...firstName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...middleName', async () => {
            // given
            schoolingRegistrations[0].middleName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...thirdName', async () => {
            // given
            schoolingRegistrations[0].thirdName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...lastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...firstName with empty middleName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].middleName = null;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...preferredLastName with empty lastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = user.lastName;
            schoolingRegistrations[0].lastName = null;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...lastName with empty preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].preferredLastName = null;
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });

        context('When schoolingRegistration found even if there is...', () => {

          it('...an accent', async () => {
            // given
            user.firstName = 'Joé';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...a white space', async () => {
            // given
            user.firstName = 'Jo e';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });

          it('...a special character', async () => {
            // given
            user.firstName = 'Jo~e';

            schoolingRegistrations[0].firstName = 'Joe';
            schoolingRegistrations[0].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });

        context('When multiple matches', () => {

          it('should prefer firstName over middleName', async () => {
            // given
            schoolingRegistrations[0].middleName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].firstName = user.firstName;
            schoolingRegistrations[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[1].id);
          });

          it('should prefer middleName over thirdName', async () => {
            // given
            schoolingRegistrations[0].thirdName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].middleName = user.firstName;
            schoolingRegistrations[1].lastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(schoolingRegistrations[1].id);
          });

          it('should prefer nobody with same lastName and preferredLastName', async () => {
            // given
            schoolingRegistrations[0].firstName = user.firstName;
            schoolingRegistrations[0].lastName = user.lastName;

            schoolingRegistrations[1].firstName = user.firstName;
            schoolingRegistrations[1].preferredLastName = user.lastName;

            // when
            const result = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, user);

            // then
            expect(result).to.equal(null);
          });
        });
      });
    });
  });

  describe('#findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser', () => {
    let organizationId;
    let schoolingRegistrationRepositoryStub;

    beforeEach(() => {
      schoolingRegistrations = [
        domainBuilder.buildSchoolingRegistration(),
        domainBuilder.buildSchoolingRegistration(),
      ];
      organizationId = domainBuilder.buildOrganization().id;
      schoolingRegistrationRepositoryStub = { findByOrganizationIdAndUserBirthdate: sinon.stub() };
    });

    context('When schoolingRegistration list is not empty', () => {

      beforeEach(() => {
        schoolingRegistrationRepositoryStub.findByOrganizationIdAndUserBirthdate.resolves(schoolingRegistrations);
      });

      context('When no schoolingRegistration matched on names', () => {

        it('should throw NotFoundError', async () => {
          // given
          user = {
            firstName: 'fakeFirstName',
            lastName: 'fakeLastName',
          };

          // when
          const result = await catchErr(userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

          // then
          expect(result).to.be.instanceOf(NotFoundError, 'There were not exactly one schoolingRegistration match for this user and organization');
        });

      });

      context('When one schoolingRegistration matched on names', () => {

        beforeEach(() => {
          user = {
            firstName: schoolingRegistrations[0].firstName,
            lastName: schoolingRegistrations[0].lastName,
          };
        });

        context('When schoolingRegistration is already linked', () => {

          it('should throw OrganizationStudentAlreadyLinkedToUserError', async () => {
            // given
            schoolingRegistrationRepositoryStub.findByOrganizationIdAndUserBirthdate.rejects(new SchoolingRegistrationAlreadyLinkedToUserError());

            // when
            const result = await catchErr(userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

            // then
            expect(result).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
          });
        });

        context('When schoolingRegistration is not already linked', () => {

          it('should return schoolingRegistrationId', async () => {
            // when
            const result = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId, user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

            // then
            expect(result).to.equal(schoolingRegistrations[0].id);
          });
        });
      });
    });

    context('When schoolingRegistration list is empty', () => {

      beforeEach(() => {
        schoolingRegistrationRepositoryStub.findByOrganizationIdAndUserBirthdate.resolves([]);
      });

      it('should throw NotFoundError', async () => {
        // given
        user = {
          firstName: 'fakeFirstName',
          lastName: 'fakeLastName',
        };

        // when
        const result = await catchErr(userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser)({ organizationId, user, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(NotFoundError, 'There were no schoolingRegistrations matching');
      });
    });
  });

  describe('#generateUsernameUntilAvailable', () => {

    let userRepository;

    beforeEach(() => {
      userRepository = {
        isUsernameAvailable: sinon.stub()
      };
    });

    it('should generate a username with original inputs', async () => {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable.resolves();
      const expectedUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

      // then
      expect(result).to.equal(expectedUsername);
    });

    it('should generate an other username when exist with original inputs', async () => {
      // given
      const firstPart = 'firstname.lastname';
      const secondPart = '0101';

      userRepository.isUsernameAvailable
        .onFirstCall().rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall().resolves();

      const originalUsername = firstPart + secondPart;

      // when
      const result = await userReconciliationService.generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

      // then
      expect(result).to.not.equal(originalUsername);
    });

  });

  describe('#createUsernameByUserAndStudentId', () => {

    let userRepository;
    let originaldUsername;

    beforeEach(() => {
      user = {
        firstName: 'fakeFirst-Name',
        lastName: 'fake LastName',
        birthdate: '2008-03-01'
      };
      originaldUsername = 'fakefirstname.fakelastname0103';

      userRepository = {
        isUsernameAvailable: sinon.stub()
      };
    });

    it('should generate a username with original user properties', async () => {
      // given
      userRepository.isUsernameAvailable.resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.equal(originaldUsername);
    });

    it('should generate a other username when exist whith original inputs', async () => {
      // given
      userRepository.isUsernameAvailable
        .onFirstCall().rejects(new AlreadyRegisteredUsernameError())
        .onSecondCall().resolves();

      // when
      const result = await userReconciliationService.createUsernameByUser({ user, userRepository });

      // then
      expect(result).to.not.equal(originaldUsername);
    });
  });

});
