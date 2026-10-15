import { expect } from 'chai';
import sinon from 'sinon';

import { ImportCertificationCpfCities } from '../../../../src/certification/scripts/import-certification-cpf-cities.js';
import { knex } from '../../../tooling/databases.js';

describe('ImportCertificationCpfCitites', function () {
  describe('Options', function () {
    it('describe correctly nesteed csv file', function () {
      const script = new ImportCertificationCpfCities();
      const { options } = script.metaInfo;

      expect(options.data).to.deep.include({
        type: 'string',
        describe: 'A filepath to cities csv file',
        demandOption: true,
      });
      expect(options.data.coerce).to.be.a('function');
    });
  });

  describe('handle', function () {
    let script;
    let logger;

    beforeEach(function () {
      script = new ImportCertificationCpfCities();
      logger = { info: sinon.spy(), error: sinon.spy() };
    });

    it('logs each step correctly', async function () {
      const filePath = 'tests/certification/scripts/integration/cities-sample';
      await script.handle({ options: { filePath }, logger });

      const calls = logger.info.getCalls();
      expect(calls[0].firstArg).to.equal('Starting script import-certification-cpf-cities');
      expect(calls[1].firstArg).to.equal('Checking tests/certification/scripts/integration/cities-sample data file...');
      expect(calls[3].firstArg).to.equal('Reading and parsing csv data file... ');
      expect(calls[5].firstArg).to.equal('Retrieving postal code, INSEE code and city name... ');
      expect(calls[7].firstArg).to.equal('Inserting cities in database... ');
    });

    it('stores cities + cities with districts', async function () {
      const filePath = 'tests/certification/scripts/integration/cities-sample';
      await script.handle({ options: { filePath }, logger });
      const citiesFromDb = await knex('certification-cpf-cities');
      expect(citiesFromDb.length).to.deep.equal(50);
      expect(citiesFromDb[0].INSEECode).to.equal('23456');
      expect(citiesFromDb[0].postalCode).to.equal('12345');
      expect(citiesFromDb[0].name).to.equal('Super Commune');
    });
  });
});
