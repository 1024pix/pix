const HigherEducationRegistrationSet = require('../../../../lib/domain/models/HigherEducationRegistrationSet');
const { expect, catchErr } = require('../../../test-helper');
const {  EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherEducationRegistrationSet', () => {

  context('#addRegistration', () => {
    context('when set has no registration', () => {
      it('creates the first registration of the set', () => {

        const higherEducationRegistrationSet = new HigherEducationRegistrationSet();
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
          studyScheme: 'I have no idea what it\'s like.'
        };

        higherEducationRegistrationSet.addRegistration(registrationAttributes);
        const registrations = higherEducationRegistrationSet.registrations;

        expect(registrations).to.have.lengthOf(1);
        expect(registrations[0]).to.deep.equal(registrationAttributes);
      });
    });

    context('when set has registrations', () => {
      it('creates the a new registration for the set', () => {

        const higherEducationRegistrationSet = new HigherEducationRegistrationSet();
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
          studyScheme: 'I have no idea what it\'s like.'
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
          studyScheme: 'I have always no idea what it\'s like.'
        };

        higherEducationRegistrationSet.addRegistration(registration1);
        higherEducationRegistrationSet.addRegistration(registration2);
        const registrations = higherEducationRegistrationSet.registrations;

        expect(registrations).to.have.lengthOf(2);
        expect(registrations[1]).to.deep.equal(registration2);
      });
    });

    context('when a registration is not valid', () => {
      it('throws an error', async () => {

        const higherEducationRegistrationSet = new HigherEducationRegistrationSet();
        const registration = {
          firstName: null,
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
        };

        const addRegistration = higherEducationRegistrationSet.addRegistration.bind(higherEducationRegistrationSet);
        const error = await catchErr(addRegistration)(registration);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there is a registration with the same student number', () => {
      it('throws an error', async () => {

        const higherEducationRegistrationSet = new HigherEducationRegistrationSet();
        const registration1 = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: new Date('1980-07-01'),
          studentNumber: 1
        };
        const registration2 = {
          firstName: 'Ishii',
          lastName: 'O-ren',
          birthdate: new Date('1990-01-01'),
          studentNumber: 1
        };

        const addRegistration = higherEducationRegistrationSet.addRegistration.bind(higherEducationRegistrationSet);
        await catchErr(addRegistration)(registration1);
        const error = await catchErr(addRegistration)(registration2);

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });
  });
});
