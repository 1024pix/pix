import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Country } from '../../../../../src/shared/domain/read-models/Country.js';
import * as countryRepository from '../../../../../src/shared/infrastructure/repositories/country-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Shared | Repository | country-repository', function () {
  describe('#findAll', function () {
    describe('when there are countries', function () {
      it('should return all common named countries ordered by name', async function () {
        // given
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99345',
          commonName: 'TOGO',
          originalName: 'TOGO',
        });

        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99345',
          commonName: 'TOGO',
          originalName: 'RÉPUBLIQUE TOGOLAISE',
        });

        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99876',
          commonName: 'NABOO',
          originalName: 'NABOO',
        });

        await databaseBuilder.commit();

        // when
        const countries = await countryRepository.findAll();

        // then
        const togoCountry = domainBuilder.buildCountry({
          code: '99345',
          name: 'TOGO',
          matcher: 'GOOT',
        });
        const nabooCountry = domainBuilder.buildCountry({
          code: '99876',
          name: 'NABOO',
          matcher: 'ABNOO',
        });
        expect(countries).to.have.lengthOf(2);
        expect(countries[0]).to.be.instanceOf(Country);
        expect(countries).to.deep.equal([nabooCountry, togoCountry]);
      });
    });

    describe('when there are no countries', function () {
      it('should return an empty array', async function () {
        // given when
        const countries = await countryRepository.findAll();

        // then
        expect(countries).to.deep.equal([]);
      });
    });
  });

  describe('#getByCode', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99345',
        commonName: 'TOGO',
        originalName: 'TOGO',
      });

      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99345',
        commonName: 'TOGO',
        originalName: 'RÉPUBLIQUE TOGOLAISE',
      });

      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99876',
        commonName: 'NABOO',
        originalName: 'NABOO',
      });

      await databaseBuilder.commit();
    });
    describe('when there is a matching code', function () {
      it('should return matching actual country', async function () {
        // when
        const result = await countryRepository.getByCode('99345');

        // then
        const togoCountry = domainBuilder.buildCountry({
          code: '99345',
          name: 'TOGO',
        });

        expect(result).to.deep.equal(togoCountry);
      });
    });

    describe('when there is no matching code', function () {
      it('should throw notFoundError', async function () {
        // given
        const nonExistingCode = '1234';

        // when
        const error = await catchErr(countryRepository.getByCode)(nonExistingCode);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findExistingCodes', function () {
    it('should return the codes matching the given codes', async function () {
      // given
      const togoCountry = databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99345',
        commonName: 'TOGO',
        originalName: 'TOGO',
      });

      const nabooCountry = databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99876',
        commonName: 'NABOO',
        originalName: 'NABOO',
      });

      await databaseBuilder.commit();

      // when
      const result = await countryRepository.findExistingCodes({ codes: [togoCountry.code, nabooCountry.code] });

      // then
      expect(result).to.deep.equal([togoCountry.code, nabooCountry.code]);
    });

    it('should return an empty array if there is no matching code', async function () {
      // given
      const nonExistingCodes = ['1234', '5678'];

      // when
      const result = await countryRepository.findExistingCodes({ codes: nonExistingCodes });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
