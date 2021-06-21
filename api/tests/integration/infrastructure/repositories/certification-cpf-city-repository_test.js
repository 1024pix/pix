const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationCpfCityRepository = require('../../../../lib/infrastructure/repositories/certification-cpf-city-repository');
const CertificationCpfCity = require('../../../../lib/domain/models/CertificationCpfCity');

describe('Integration | Repository | certificationCpfCityRepository', () => {

  describe('#findByINSEECode', () => {

    context('when there are cities matching the INSEE code', () => {

      it('should return an array of certificationCPFCity', async () => {
        // given
        const INSEECode = '12345';

        const actualCity = domainBuilder.buildCertificationCpfCity({
          id: 1,
          INSEECode,
          name: 'ACTUAL NAME',
          postalCode: '56789',
          isActualName: true,
        });

        const oldCity = domainBuilder.buildCertificationCpfCity({
          id: 2,
          INSEECode,
          name: 'OLD NAME',
          postalCode: '56789',
          isActualName: false,
        });

        databaseBuilder.factory.buildCertificationCpfCity(actualCity);
        databaseBuilder.factory.buildCertificationCpfCity(oldCity);
        await databaseBuilder.commit();

        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, oldCity]);
      });
    });

    context('when there is no city matching the INSEE code', () => {

      it('should return an empty array', async () => {
        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode: 'unknown_INSEE_code' });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result).to.have.lengthOf(0);
      });
    });
  });
});
