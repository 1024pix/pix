const { expect, databaseBuilder, knex } = require('../../../test-helper');
const iconv = require('iconv-lite');

const importHigherSchoolingRegistration = require('../../../../lib/domain/usecases/import-higher-schooling-registrations');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const HigherSchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');
const HigherSchoolingRegistrationColumns = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-columns');
const { getI18n } = require('../../../../tests/tooling/i18n/i18n');

const i18n = getI18n();

const higherSchoolingRegistrationColumns = new HigherSchoolingRegistrationColumns(i18n).columns
  .map((column) => column.label)
  .join(';');

describe('Integration | UseCase | ImportHigherSchoolingRegistration', function () {
  afterEach(function () {
    return knex('organization-learners').delete();
  });

  context('when there is no schooling registrations for the organization', function () {
    it('parses the csv received and creates the HigherSchoolingRegistration', async function () {
      const input = `${higherSchoolingRegistrationColumns}
          Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
          O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
      `.trim();

      const encodedInput = iconv.encode(input, 'utf8');

      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
      await importHigherSchoolingRegistration({
        organizationId: organization.id,
        higherSchoolingRegistrationRepository,
        higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
      });

      const registrations = await knex('organization-learners').where({ organizationId: organization.id });
      expect(registrations).to.have.lengthOf(2);
    });
  });

  context('when there are schooling registration for the organization', function () {
    context('which matches by student number', function () {
      it('updates the existing schooling registration which have matched with csv data', async function () {
        const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        `.trim();

        const encodedInput = iconv.encode(input, 'utf8');

        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          studentNumber: '123456',
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1970-01-01',
          email: 'old.email@dva.com',
        });

        await databaseBuilder.commit();
        await importHigherSchoolingRegistration({
          organizationId: organization.id,
          higherSchoolingRegistrationRepository,
          higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
        });

        const [registration] = await knex('organization-learners').where({ organizationId: organization.id });
        expect(registration.email).to.equal('thebride@example.net');
      });
    });
  });

  it('should return warnings about the import', async function () {
    const input = `${higherSchoolingRegistrationColumns}
            Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;BAD;BAD;
        `.trim();

    const encodedInput = iconv.encode(input, 'utf8');
    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    const warnings = await importHigherSchoolingRegistration({
      organizationId: organization.id,
      higherSchoolingRegistrationRepository,
      higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id, i18n),
    });

    expect(warnings).to.deep.equal([
      { studentNumber: '123456', field: 'study-scheme', value: 'BAD', code: 'unknown' },
      { studentNumber: '123456', field: 'diploma', value: 'BAD', code: 'unknown' },
    ]);
  });
});
