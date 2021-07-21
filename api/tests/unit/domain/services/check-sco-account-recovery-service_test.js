const {
  expect,
  sinon,
  domainBuilder,
  catchErr,
} = require('../../../test-helper');
const { retrieveSchoolingRegistration } = require('../../../../lib/domain/services/check-sco-account-recovery-service');
const { MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError } = require('../../../../lib/domain/errors');

describe('Unit | Service | check-sco-account-recovery-service', () => {

  describe('#retrieveSchoolingRegistration', () => {

    let schoolingRegistrationRepository;
    let userRepository;

    beforeEach(() => {
      schoolingRegistrationRepository = {
        getSchoolingRegistrationInformation: sinon.stub(),
        findByUserId: sinon.stub(),
      };
      userRepository = {
        get: sinon.stub(),
      };
    });

    context('when user is reconciled to several organizations', () => {

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
            ...studentInformation,
          });
          const secondSchoolingRegistration = domainBuilder.buildSchoolingRegistration({
            id: 3,
            userId: expectedUser.id,
            organization: secondOrganization,
            updatedAt: new Date('2005-01-01T15:00:00Z'),
            ...studentInformation,
          });

          schoolingRegistrationRepository.getSchoolingRegistrationInformation
            .withArgs({ ...studentInformation, nationalStudentId: studentInformation.ineIna })
            .resolves({
              id: secondSchoolingRegistration.id,
              organizationId: secondOrganization.id,
              userId: expectedUser.id,
              firstName: expectedUser.firstName,
              lastName: expectedUser.lastName,
            });
          schoolingRegistrationRepository.findByUserId
            .withArgs({ userId: expectedUser.id })
            .resolves([firstSchoolingRegistration, secondSchoolingRegistration]);
          userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

          // when
          const result = await retrieveSchoolingRegistration({
            studentInformation,
            schoolingRegistrationRepository,
            userRepository,
          });

          // then
          const expectedResult = {
            firstName: 'Nanou',
            lastName: 'Monchose',
            username: 'nanou.monchose0705',
            email: 'nanou.monchose@example.net',
            id: 3,
            userId: 9,
            organizationId: 7,
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
            .withArgs({ ...studentInformation, nationalStudentId: studentInformation.ineIna })
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
          const result = await catchErr(retrieveSchoolingRegistration)({
            studentInformation,
            schoolingRegistrationRepository,
            userRepository,
          });

          // then
          expect(result).to.be.instanceof(MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError);
        });
      });
    });

    context('when user has a single schooling registration', () => {
      it('should return user account information with schooling registration first name', async () => {
        // given
        const studentInformation = {
          ineIna: '123456789AA',
          firstName: 'Nanou',
          lastName: 'Monchose',
          birthdate: '2004-05-07',
        };
        const expectedUser = domainBuilder.buildUser({
          id: 9,
          firstName: 'Manuela',
          lastName: studentInformation.lastName,
          birthdate: studentInformation.birthdate,
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
        });
        const organization = domainBuilder.buildOrganization({ id: 8, name: 'Collège Beauxbâtons' });
        const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
          id: 2,
          userId: expectedUser.id,
          organization: organization,
          updatedAt: new Date('2000-01-01T15:00:00Z'),
          ...studentInformation,
          firstName: expectedUser.firstName,
        });

        schoolingRegistrationRepository.getSchoolingRegistrationInformation
          .withArgs({ ...studentInformation, nationalStudentId: studentInformation.ineIna })
          .resolves({
            id: schoolingRegistration.id,
            organizationId: organization.id,
            userId: expectedUser.id,
            firstName: expectedUser.firstName,
            lastName: expectedUser.lastName,
          });
        schoolingRegistrationRepository.findByUserId
          .withArgs({ userId: expectedUser.id })
          .resolves([schoolingRegistration]);
        userRepository.get.withArgs(expectedUser.id).resolves(expectedUser);

        // when
        const result = await retrieveSchoolingRegistration({
          studentInformation,
          schoolingRegistrationRepository,
          userRepository,
        });

        // then
        const expectedResult = {
          firstName: 'Manuela',
          lastName: 'Monchose',
          username: 'nanou.monchose0705',
          email: 'nanou.monchose@example.net',
          id: 2,
          userId: 9,
          organizationId: 8,
        };
        expect(result).to.deep.equal(expectedResult);
      });
    });
  });
});
