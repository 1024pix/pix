import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import countryRepository from '../../../../lib/infrastructure/repositories/country-repository';
import { Country } from '../../../../lib/domain/read-models/Country';

describe('Integration | Repository | country-repository', function () {
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
        expect(countries.length).to.equal(2);
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
});
