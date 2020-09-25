const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const HigherSchoolingRegistration = require('../../../../lib/domain/models/HigherSchoolingRegistration');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../../../lib/domain/errors');

describe('Integration | Infrastructure | Repository | higher-schooling-registration-repository', () => {

  describe('#saveSet', () => {
    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('when there is no schooling registration with the same student number', () => {
      it('save all the higher schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration1 = {
          organizationId: organization.id,
          firstName: 'Elle',
          middleName: 'One',
          thirdName: 'Eyed',
          lastName: 'Driver',
          preferredLastName: 'California Mountain Snake',
          studentNumber: '3',
          email: 'driver@example.net',
          birthdate: '1975-07-01',
          diploma: 'BTS',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.',
        };
        const registration1Attributes = {
          organizationId: organization.id,
          firstName: 'Elle',
          middleName: 'One',
          thirdName: 'Eyed',
          lastName: 'Driver',
          preferredLastName: 'California Mountain Snake',
          studentNumber: '3',
          email: 'driver@example.net',
          birthdate: '1975-07-01',
          diploma: 'BTS',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          status: 'I have no idea what it\'s like.',
        };
        const registration2 = {
          organizationId: organization.id,
          firstName: 'O-Ren',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '4',
          email: 'ishii@example.net',
          birthdate: '1990-07-01',
          diploma: 'DUT',
          department: 'The Crazy 88',
          educationalTeam: 'Bill',
          group: 'Tokyo Crime World',
          studyScheme: 'I have always no idea what it\'s like.',
        };
        const registration2Attributes = {
          organizationId: organization.id,
          firstName: 'O-Ren',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '4',
          email: 'ishii@example.net',
          birthdate: '1990-07-01',
          diploma: 'DUT',
          department: 'The Crazy 88',
          educationalTeam: 'Bill',
          group: 'Tokyo Crime World',
          status: 'I have always no idea what it\'s like.',
        };

        higherSchoolingRegistrationSet.addRegistration(registration1);
        higherSchoolingRegistrationSet.addRegistration(registration2);

        await higherSchoolingRegistrationRepository.saveSet(higherSchoolingRegistrationSet, organization.id);

        const higherSchoolingRegistrations = await knex('schooling-registrations').where({ organizationId: organization.id }).orderBy('firstName');
        expect(higherSchoolingRegistrations).to.have.lengthOf(2);
        expect(higherSchoolingRegistrations[0]).to.include(registration1Attributes);
        expect(higherSchoolingRegistrations[1]).to.include(registration2Attributes);
      });
    });

    context('when there is schooling registration with the same student number for the same organization', () =>  {
      it('does not add any schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          preferredLastName: 'Sidewinder',
          studentNumber: '12',
          organizationId: organization.id,
        });

        await databaseBuilder.commit();

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration = {
          preferredLastName: 'California Mountain Snake',
          studentNumber: '12',
          firstName: 'Elle',
          lastName: 'Driver',
          birthdate: '2020-01-01',
          organizationId: organization.id,
        };

        higherSchoolingRegistrationSet.addRegistration(registration);

        await higherSchoolingRegistrationRepository.saveSet(higherSchoolingRegistrationSet, organization.id);
        const higherSchoolingRegistrations = await knex('schooling-registrations').where({ organizationId: organization.id });

        expect(higherSchoolingRegistrations).to.have.lengthOf(1);
        expect(higherSchoolingRegistrations[0].preferredLastName).to.equal(registration.preferredLastName);
      });
    });

    context('when there is schooling registration with the same student number for another organization', () => {
      it('add schooling registrations', async function() {

        const organization = databaseBuilder.factory.buildOrganization();
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({
          preferredLastName: 'Sidewinder',
          studentNumber: '12',
          organizationId: otherOrganization.id,
        });

        await databaseBuilder.commit();

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration = {
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate: '2020-01-01',
          preferredLastName: 'Sidewinder',
          studentNumber: '12',
          organizationId: organization.id,
        };

        higherSchoolingRegistrationSet.addRegistration(registration);

        await higherSchoolingRegistrationRepository.saveSet(higherSchoolingRegistrationSet, organization.id);

        const higherSchoolingRegistrations = await knex('schooling-registrations').where({ preferredLastName: 'Sidewinder' });

        const organizationIds = higherSchoolingRegistrations.map(({ organizationId }) => organizationId);

        expect(organizationIds).to.exactlyContain([organization.id, otherOrganization.id]);
      });
    });
  });

  describe('#saveAndReconcile', () => {
    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    context('when there is no other schooling registration with the same student number in the organization', () => {
      it('should create higher schooling registration reconciled with user', async function() {
        //given
        const organization = databaseBuilder.factory.buildOrganization();
        const userId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();

        const higherSchoolingRegistrationAttributes = {
          studentNumber: '123456',
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate: '2010-01-01',
          organizationId: organization.id,
        };

        const higherSchoolingRegistration = new HigherSchoolingRegistration(higherSchoolingRegistrationAttributes);

        //when
        await higherSchoolingRegistrationRepository.saveAndReconcile(higherSchoolingRegistration, userId);

        //then
        const [createdHigherSchoolingRegistration] = await knex('schooling-registrations').where({ organizationId: organization.id });
        expect(createdHigherSchoolingRegistration).to.contain(higherSchoolingRegistrationAttributes);
        expect(createdHigherSchoolingRegistration.userId).to.equal(userId);
      });
    });
    context('when there is another schooling registration with the same student number in the organization', () => {
      it('throws an error', async function() {
        //given
        const organization = databaseBuilder.factory.buildOrganization();
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: '123456', organizationId: organization.id });

        await databaseBuilder.commit();

        const higherSchoolingRegistrationAttributes = {
          studentNumber: '123456',
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate: '2010-01-01',
          organizationId: organization.id,
        };

        const higherSchoolingRegistration = new HigherSchoolingRegistration(higherSchoolingRegistrationAttributes);

        //when
        const error = await catchErr(higherSchoolingRegistrationRepository.saveAndReconcile)(higherSchoolingRegistration, userId);

        //then
        expect(error).to.be.an.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);

      });
    });
  });

  describe('#findByOrganizationIdAndStudentNumber', () => {

    let organization;
    const studentNumber = '123A';

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        studentNumber,
        isSupernumerary: true,
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        studentNumber,
        isSupernumerary: true,
      });
      await databaseBuilder.commit();
    });

    it('should return found schoolingRegistrations with student number', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: organization.id, studentNumber });

      // then
      expect(result.length).to.be.equal(2);
    });

    it('should return empty array when there is no schooling-registrations with the given student number', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: organization.id, studentNumber: '123B' });

      // then
      expect(result.length).to.be.equal(0);
    });

    it('should return empty array when there is no schooling-registrations with the given organizationId', async () => {
      // when
      const result = await higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber({ organizationId: '999', studentNumber });

      // then
      expect(result.length).to.be.equal(0);
    });
  });

  describe('#findOneRegisteredByOrganizationIdAndUserData', () => {

    let organizationId;
    const studentNumber = '1234567';
    const birthdate = '2000-03-31';

    beforeEach(() => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      return databaseBuilder.commit();
    });

    context('When there is no registered schooling registrations', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, isSupernumerary: true, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations for the organization', () => {
      beforeEach(async () => {
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherOrganizationId, isSupernumerary: false, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given student number', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber: '999', isSupernumerary: false, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given birthdate', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, isSupernumerary: false, birthdate: '2000-03-30' });
        await databaseBuilder.commit();
      });

      it('should return null', async () => {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is a matching schooling registrations with student number only', () => {
      let expectedSchoolingRegistrationId;
      beforeEach(async () => {
        expectedSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, isSupernumerary: false, birthdate }).id;
        await databaseBuilder.commit();
      });

      it('should return the schooling registration', async () => {
        // when
        const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { studentNumber } });

        // then
        expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
        expect(schoolingRegistration.id).to.equal(expectedSchoolingRegistrationId);
      });
    });

    context('When there is a matching schooling registrations with birthdate only', () => {
      let expectedSchoolingRegistrationId;
      beforeEach(async () => {
        expectedSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, isSupernumerary: false, birthdate }).id;
        await databaseBuilder.commit();
      });

      it('should return the schooling registration', async () => {
        // when
        const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate } });

        // then
        expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
        expect(schoolingRegistration.id).to.equal(expectedSchoolingRegistrationId);
      });
    });

    context('When there is a matching schooling registrations with student number and birthdate', () => {
      let expectedSchoolingRegistrationId;
      beforeEach(async () => {
        expectedSchoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId, studentNumber, isSupernumerary: false, birthdate }).id;
        await databaseBuilder.commit();
      });

      it('should return the schooling registration', async () => {
        // when
        const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { studentNumber, birthdate } });

        // then
        expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
        expect(schoolingRegistration.id).to.equal(expectedSchoolingRegistrationId);
      });
    });
  });

  describe('#updateStudentNumber', () => {
    it('should update the student number', async () => {
      // given
      const id = databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: 12345 }).id;
      await databaseBuilder.commit();

      // when
      await higherSchoolingRegistrationRepository.updateStudentNumber(id, 54321);
      const [schoolingRegistration] = await knex.select('studentNumber').from('schooling-registrations').where({ id });
      expect(schoolingRegistration.studentNumber).to.equal('54321');
    });
  });
});
