const {
  expect,
  sinon,
  domainBuilder,
  catchErr,
} = require('../../../test-helper');
const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../../../lib/domain/errors');
const StudentInformationForAccountRecovery = require('../../../../lib/domain/read-models/StudentInformationForAccountRecovery');
const checkScoAccountRecovery = require('../../../../lib/domain/usecases/check-sco-account-recovery');

describe('Unit | UseCase | check-sco-account-recovery', () => {

  let schoolingRegistrationRepository;
  let userRepository;
  let organizationRepository;

  beforeEach(() => {
    schoolingRegistrationRepository = {
      getSchoolingRegistrationInformation: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
  });

  context('when user exists', () => {

    context('when user have only one schooling registration', () => {

      it('should return user account information', async () => {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };
        const expectedUser = domainBuilder.buildUser({
          id: 9,
          firstName: studentInformation.firstName,
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
        });
        const expectedOrganization = domainBuilder.buildOrganization({ id: 7, name: 'Lycée Poudlard' });
        const expectedSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
          id: 10,
          userId: expectedUser.id,
          organization: expectedOrganization,
          nationalStudentId: studentInformation.ineIna,
          ...studentInformation,
        });

        schoolingRegistrationRepository.getSchoolingRegistrationInformation
          .withArgs({
            ...studentInformation,
            nationalStudentId: studentInformation.ineIna,
          })
          .resolves({
            organizationId: expectedOrganization.id,
            userId: expectedUser.id,
            firstName: expectedUser.firstName,
            lastName: expectedUser.lastName,
          });
        schoolingRegistrationRepository.findByUserId.withArgs({ userId: expectedUser.id }).resolves([expectedSchoolingRegistration]);
        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);
        organizationRepository.get.withArgs(expectedOrganization.id).resolves(expectedOrganization);

        // when
        const result = await checkScoAccountRecovery({
          studentInformation,
          schoolingRegistrationRepository,
          organizationRepository,
          userRepository,
        });

        // then
        const expectedResult = {
          firstName: 'Nanou',
          lastName: 'Monchose',
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
          latestOrganizationName: 'Lycée Poudlard',
        };
        expect(result).to.deep.equal(expectedResult);
        expect(result).to.be.instanceof(StudentInformationForAccountRecovery);
      });
    });

    context('when user have multiple schooling registrations', () => {

      context('when all schooling registrations have the same INE', () => {

        it('should return user account information', async () => {
          // given
          const studentInformation = {
            ineIna: '123456789AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          };
          const expectedUser = domainBuilder.buildUser({
            id: 9,
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
            birthdate: studentInformation.birthdate,
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
          });
          const firstOrganization = domainBuilder.buildOrganization({ id: 8, name: 'Collège Beauxbâtons' });
          const secondOrganization = domainBuilder.buildOrganization({ id: 7, name: 'Lycée Poudlard' });
          const firstSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 2,
            userId: expectedUser.id,
            organization: firstOrganization,
            updatedAt: new Date('2000-01-01T15:00:00Z'),
            nationalStudentId: studentInformation.ineIna,
            ...studentInformation,
          });
          const secondSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 3,
            userId: expectedUser.id,
            organization: secondOrganization,
            updatedAt: new Date('2005-01-01T15:00:00Z'),
            nationalStudentId: studentInformation.ineIna,
            ...studentInformation,
          });

          schoolingRegistrationRepository.getSchoolingRegistrationInformation
            .withArgs({
              ...studentInformation,
              nationalStudentId: studentInformation.ineIna,
            })
            .resolves({
              organizationId: secondOrganization.id,
              userId: expectedUser.id,
              firstName: expectedUser.firstName,
              lastName: expectedUser.lastName,
            });
          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: expectedUser.id })
            .resolves([firstSchoolingRegistration, secondSchoolingRegistration]);
          userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);
          organizationRepository.get.withArgs(secondOrganization.id).resolves(secondOrganization);

          // when
          const result = await checkScoAccountRecovery({
            studentInformation,
            schoolingRegistrationRepository,
            organizationRepository,
            userRepository,
          });

          // then
          const expectedResult = {
            firstName: 'Nanou',
            lastName: 'Monchose',
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
            latestOrganizationName: 'Lycée Poudlard',
          };
          expect(result).to.deep.equal(expectedResult);
        });
      });

      context('when at least one schooling registrations has a different INE', () => {

        it('should throw an error', async () => {
          // given
          const studentInformation = {
            ineIna: '123456789AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          };
          const user = domainBuilder.buildUser({
            id: 9,
            firstName: studentInformation.firstName,
            lastName: studentInformation.lastName,
            birthdate: studentInformation.birthdate,
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
          });

          const firstSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 6,
            userId: user.id,
            nationalStudentId: studentInformation.ineIna,
            ...studentInformation,
          });
          const secondSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 9,
            userId: user.id,
            nationalStudentId: '111111111AA',
            firstName: 'Nanou',
            lastName: 'Monchose',
            birthdate: '2004-05-07',
          });

          schoolingRegistrationRepository.getSchoolingRegistrationInformation
            .withArgs({
              ...studentInformation,
              nationalStudentId: studentInformation.ineIna,
            })
            .resolves({
              organizationId: 1,
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
            });
          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: user.id })
            .resolves([firstSchoolingRegistration, secondSchoolingRegistration]);

          // when
          const result = await catchErr(checkScoAccountRecovery)({
            studentInformation,
            schoolingRegistrationRepository,
            organizationRepository,
            userRepository,
          });

          // then
          expect(result).to.be.instanceof(MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError);
        });
      });
    });
  });

});
