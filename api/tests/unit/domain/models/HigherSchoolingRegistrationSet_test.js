const HigherSchoolingRegistrationSet = require('../../../../lib/domain/models/HigherSchoolingRegistrationSet');
const { expect, catchErr } = require('../../../test-helper');
const { getI18n } = require('../../../tooling/i18n/i18n');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherSchoolingRegistrationSet', () => {
  const i18n = getI18n();

  context('#addRegistration', () => {
    context('when set has no registration', () => {
      it('creates the first registration of the set', () => {
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registrationAttributes = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          diploma: 'Autre',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'Autre',
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
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registration1 = {
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '1',
          email: 'thebride@example.net',
          birthdate: new Date('1980-07-01'),
          diploma: 'Autre',
          department: 'Assassination Squad',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'Autre',
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
          diploma: 'Autre',
          department: 'Assassination Squad Management',
          educationalTeam: 'Pai Mei',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'Autre',
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
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
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
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
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

        const error = await catchErr(
          higherSchoolingRegistrationSet.addRegistration,
          higherSchoolingRegistrationSet,
        )(registration2);

        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.key).to.equal('studentNumber');
        expect(error.why).to.equal('uniqueness');
      });
    });

    context('When there are warnings', () => {
      it('should add a diploma warning', async () => {
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registration = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'BAD',
          studyScheme: 'Autre',
        };

        higherSchoolingRegistrationSet.addRegistration(registration);
        const { registrations, warnings } = higherSchoolingRegistrationSet;

        expect(registrations).to.have.lengthOf(1);
        expect(registrations[0].diploma).to.equal('Non reconnu');
        expect(warnings).to.have.lengthOf(1);
        expect(warnings[0]).to.deep.equal({ studentNumber: '123ABC', field: 'diploma', value: 'BAD', code: 'unknown' });
      });

      it('should add a study scheme warning', async () => {
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registration = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'Autre',
          studyScheme: 'BAD',
        };

        higherSchoolingRegistrationSet.addRegistration(registration);
        const { registrations, warnings } = higherSchoolingRegistrationSet;

        expect(registrations).to.have.lengthOf(1);
        expect(registrations[0].studyScheme).to.equal('Non reconnu');
        expect(warnings).to.have.lengthOf(1);
        expect(warnings[0]).to.deep.equal({ studentNumber: '123ABC', field: 'study-scheme', value: 'BAD', code: 'unknown' });
      });

      it('should check diplomas and study schemes with lower case', async () => {
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registration = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'aUTRe',
          studyScheme: 'aUTRe',
        };

        higherSchoolingRegistrationSet.addRegistration(registration);
        const { registrations, warnings } = higherSchoolingRegistrationSet;

        expect(registrations).to.have.lengthOf(1);
        expect(warnings).to.have.lengthOf(0);
      });

      it('should check diplomas and study schemes with Levenshtein distance', async () => {
        const higherSchoolingRegistrationSet = new HigherSchoolingRegistrationSet(i18n);
        const registration = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'Autra',
          studyScheme: 'Autra',
        };

        higherSchoolingRegistrationSet.addRegistration(registration);
        const { registrations, warnings } = higherSchoolingRegistrationSet;

        expect(registrations).to.have.lengthOf(1);
        expect(warnings).to.have.lengthOf(0);
      });
    });
  });
});
