/* eslint-disable no-sync */
// Usage: node import-apprentices path/file.csv
const { OrganizationNotFoundError } = require('../../lib/domain/errors');
const { CsvColumn } = require('../../lib/infrastructure/serializers/csv/csv-registration-parser');

const SchoolingRegistrationParser = require('../../lib/infrastructure/serializers/csv/schooling-registration-parser');
const fs = require('fs');

const { knex } = require('../../db/knex-database-connection');

const column = new CsvColumn({ name: 'uai', label: 'UAI*', isRequired: true });

const { getI18n } = require('../../tests/tooling/i18n/i18n');
const i18n = getI18n();

class CsvApprenticesParser extends SchoolingRegistrationParser {
  constructor(input, oranizationByUAI, i18n) {
    super(input, null, i18n, true);
    this.organizationByUai = oranizationByUAI;
    this._columns.push(column);
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {};

    this._columns.forEach((column) => {
      const value = line[column.label];
      if (column.isDate) {
        registrationAttributes[column.name] = this._buildDateAttribute(value);
      } else if (column.name === 'uai') {
        const organizationId = this.organizationByUai[value];

        if (!organizationId) {
          throw new OrganizationNotFoundError(`l'uai : ${value} n'est rattaché à aucune organisation. Veuillez vérifier votre fichier`);
        }

        registrationAttributes.organizationId = organizationId;
      } else {
        registrationAttributes[column.name] = value;
      }
    });

    return registrationAttributes;
  }
}

async function findOrganizationByUai() {
  const organizations = await knex.select(['id as organizationId', 'externalId']).from('organizations').where({ type: 'SCO' });
  const organizationByUai = {};

  organizations.forEach(({ organizationId, externalId }) => organizationByUai[externalId] = organizationId);

  return organizationByUai;
}

async function importApprentices(filePath, fileSystem) {
  const input = fileSystem.readFileSync(filePath);
  const organizationByUai = await findOrganizationByUai();

  const csvApprenticesParser = new CsvApprenticesParser(input, organizationByUai, i18n);
  const schoolingRegistrationSet = csvApprenticesParser.parse();
  await knex.batchInsert('schooling-registrations', schoolingRegistrationSet.registrations);
}

async function main() {
  return importApprentices(process.argv[2], fs);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = importApprentices;
