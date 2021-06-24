const { expect, databaseBuilder } = require('../../../test-helper');
const countryRepository = require('../../../../lib/infrastructure/repositories/country-repository');
const { Country } = require('../../../../lib/domain/read-models/Country');

describe('Integration | Repository | country-repository', () => {

  describe('#findAll', () => {

    describe('when there are countries', () => {

      it('should return all common named countries', async () => {
        // given
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99345',
          commonName: 'TOGO',
          originalName: 'TOGO',
          id: 3,
        });

        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99345',
          commonName: 'TOGO',
          originalName: 'RÉPUBLIQUE TOGOLAISE',
          id: 1,
        });

        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99876',
          commonName: 'NABOO',
          originalName: 'NABOO',
          id: 2,
        });

        await databaseBuilder.commit();

        // when
        const countries = await countryRepository.findAll();

        // then
        expect(countries.length).to.equal(2);
        expect(countries[0]).to.be.instanceOf(Country);
        expect(countries).to.deep.equal([
          {
            code: '99876',
            name: 'NABOO',
          },
          {
            code: '99345',
            name: 'TOGO',
          },
        ]);
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
