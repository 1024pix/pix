import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import certificationCpfCityRepository from '../../../../lib/infrastructure/repositories/certification-cpf-city-repository';
import CertificationCpfCity from '../../../../lib/domain/models/CertificationCpfCity';

describe('Integration | Repository | certificationCpfCityRepository', function () {
  describe('#findByINSEECode', function () {
    context('when there are cities matching the INSEE code', function () {
      it('should return an array of certificationCPFCity', async function () {
        // given
        const INSEECode = '12345';

        const olderCity = domainBuilder.buildCertificationCpfCity({
          id: 1,
          postalCode: '12345',
          INSEECode,
          name: 'OLDER NAME',
          isActualName: false,
        });

        const oldCity = domainBuilder.buildCertificationCpfCity({
          id: 2,
          postalCode: '12345',
          INSEECode,
          name: 'OLD NAME',
          isActualName: false,
        });

        const actualCity = domainBuilder.buildCertificationCpfCity({
          id: 3,
          postalCode: '12345',
          INSEECode,
          name: 'ACTUAL NAME',
          isActualName: true,
        });

        databaseBuilder.factory.buildCertificationCpfCity(actualCity);
        databaseBuilder.factory.buildCertificationCpfCity(oldCity);
        databaseBuilder.factory.buildCertificationCpfCity(olderCity);
        await databaseBuilder.commit();

        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
      });
    });

    context('when there is no city matching the INSEE code', function () {
      it('should return an empty array', async function () {
        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode: 'unknown_INSEE_code' });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result).to.have.lengthOf(0);
      });
    });
  });

  describe('#findByPostalCode', function () {
    context('when there are cities matching the postal code', function () {
      it('should return an array of certificationCpfCity', async function () {
        // given
        const postalCode = '12345';

        const olderCity = domainBuilder.buildCertificationCpfCity({
          id: 1,
          postalCode,
          INSEECode: '56789',
          name: 'OLDER NAME',
          isActualName: false,
        });

        const oldCity = domainBuilder.buildCertificationCpfCity({
          id: 2,
          postalCode,
          INSEECode: '56789',
          name: 'OLD NAME',
          isActualName: false,
        });

        const actualCity = domainBuilder.buildCertificationCpfCity({
          id: 3,
          postalCode,
          INSEECode: '56789',
          name: 'ACTUAL NAME',
          isActualName: true,
        });

        databaseBuilder.factory.buildCertificationCpfCity(actualCity);
        databaseBuilder.factory.buildCertificationCpfCity(oldCity);
        databaseBuilder.factory.buildCertificationCpfCity(olderCity);
        await databaseBuilder.commit();

        // when
        const result = await certificationCpfCityRepository.findByPostalCode({ postalCode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
      });
    });

    context('when there is no city matching the postal code', function () {
      it('should return an empty array', async function () {
        // when
        const result = await certificationCpfCityRepository.findByPostalCode({ postalCode: 'unknown_postal_code' });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result).to.have.lengthOf(0);
      });
    });
  });
});
