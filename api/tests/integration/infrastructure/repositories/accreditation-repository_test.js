const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const accreditationRepository = require('../../../../lib/infrastructure/repositories/accreditation-repository');

describe('Integration | Repository | accreditation-repository', function() {

  describe('#findAll', function() {

    describe('when there are accreditations', function() {

      it('should return all accreditations ordered by id', async function() {
        // given
        databaseBuilder.factory.buildAccreditation({
          id: 1,
          name: 'Pix+Edu',
        });
        databaseBuilder.factory.buildAccreditation({
          id: 2,
          name: 'Pix+Droit',
        });
        databaseBuilder.factory.buildAccreditation({
          id: 3,
          name: 'CléA Numérique',
        });

        await databaseBuilder.commit();

        // when
        const accreditations = await accreditationRepository.findAll();

        // then
        const expectedAccreditations = [
          domainBuilder.buildAccreditation({
            id: 1,
            name: 'Pix+Edu',
          }),
          domainBuilder.buildAccreditation({
            id: 2,
            name: 'Pix+Droit',
          }),
          domainBuilder.buildAccreditation({
            id: 3,
            name: 'CléA Numérique',
          }),
        ];

        expect(accreditations).to.deepEqualArray(expectedAccreditations);
      });
    });

    describe('when there are no accreditations', function() {

      it('should return an empty array', async function() {
        // given when
        const accreditations = await accreditationRepository.findAll();

        // then
        expect(accreditations).to.be.empty;
      });
    });
  });
});
