const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const countryRepository = require('../../../../lib/infrastructure/repositories/country-repository');
const { Country } = require('../../../../lib/domain/read-models/Country');

describe('Integration | Repository | country-repository', () => {

  describe('#findAll', () => {

    describe('when there are countries', () => {

      it('should return all common named countries ordered by name', async () => {
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

    describe('when there are no countries', () => {

      it('should return an empty array', async () => {
        // given when
        const countries = await countryRepository.findAll();

        // then
        expect(countries).to.deep.equal([]);
      });
    });
  });
});
