const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { expect, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherSchoolingRegistrationSet', () => {

  context('#addRegistration', () => {
    context('when set has no registration', () => {
      it('creates the first registration of the set', () => {

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registrationAttributes = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          diploma: 'Master',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.',
          organizationId: 1,
        };

        higherSchoolingRegistrationSet.addRegistration(registrationAttributes);
        const registrations = higherSchoolingRegistrationSet.registrations;

        expect(registrations).to.have.lengthOf(1);
        expect(registrations[0]).to.deep.equal(registrationAttributes);
      });
    });

    context('when set has registrations', () => {
      it('creates the a new registration for the set', () => {

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration1 = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          diploma: 'Master',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have no idea what it\'s like.',
          userId: 12345,
          organizationId: 1,
        };
        const registration2 = {
          firstName: 'Bill',
          middleName: 'Unknown',
          thirdName: 'Unknown',
          lastName: 'Unknown',
          preferredLastName: 'Snake Charmer',
          studentNumber: '2',
          email: 'bill@example.net',
          birthdate: new Date('1960-07-01'),
          diploma: 'Doctorat',
          department: 'Assassination Squad Management',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'I have always no idea what it\'s like.',
          organizationId: 2,
        };

        higherSchoolingRegistrationSet.addRegistration(registration1);
        higherSchoolingRegistrationSet.addRegistration(registration2);
        const registrations = higherSchoolingRegistrationSet.registrations;

        expect(registrations).to.have.lengthOf(2);
        expect(registrations[1]).to.deep.equal(registration2);
      });
    });

    context('when a registration is not valid', () => {
      it('throws an error', async () => {

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration = {
          firstName: null,
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        };

        const addRegistration = higherSchoolingRegistrationSet.addRegistration.bind(higherSchoolingRegistrationSet);
        const error = await catchErr(addRegistration)(registration);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there is a registration with the same student number', () => {
      it('throws an error', async () => {

        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet();
        const registration1 = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
        };
        const registration2 = {
          firstName: 'Ishii',
          lastName: 'O-ren',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
        };
        await higherSchoolingRegistrationSet.addRegistration(registration1);

        const error = await catchErr(higherSchoolingRegistrationSet.addRegistration, higherSchoolingRegistrationSet)(registration2);

        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.key).to.equal('studentNumber');
        expect(error.why).to.equal('uniqueness');
      });
    });
  });
});
