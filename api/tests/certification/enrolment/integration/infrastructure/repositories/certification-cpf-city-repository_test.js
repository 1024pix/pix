import { expect } from 'chai';
import sinon from 'sinon';

import * as certificationCpfCityRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import { CertificationCpfCity } from '../../../../../../src/certification/shared/domain/models/CertificationCpfCity.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | certificationCpfCityRepository', function () {
  let queryHook;
  beforeEach(function () {
    certificationCpfCityRepository.clearCache();
    queryHook = sinon.stub();
    knex.addListener('query', queryHook);
  });

  afterEach(async function () {
    knex.removeListener('query', queryHook);
  });

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

    context('caching', function () {
      it('reads the value from the database when cities with the given INSEECode are not cached', async function () {
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
        queryHook.reset();

        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
        expect(queryHook).to.have.been.calledOnce;
      });

      it('reads the value from the cache when cities with the given INSEECode are cached', async function () {
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
        await certificationCpfCityRepository.findByINSEECode({ INSEECode });
        queryHook.reset();

        // when
        const result = await certificationCpfCityRepository.findByINSEECode({ INSEECode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
        expect(queryHook).to.not.have.been.called;
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

    context('caching', function () {
      it('reads the cities from the database when there are no cached entries for postal code', async function () {
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
        queryHook.reset();

        // when
        const result = await certificationCpfCityRepository.findByPostalCode({ postalCode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
        expect(queryHook).to.have.been.calledOnce;
      });

      it('reads the cities from the cache when there are cached entries for postal code', async function () {
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
        await certificationCpfCityRepository.findByPostalCode({ postalCode });
        queryHook.reset();

        // when
        const result = await certificationCpfCityRepository.findByPostalCode({ postalCode });

        // then
        expect(result).to.be.an.instanceOf(Array);
        expect(result[0]).to.be.an.instanceOf(CertificationCpfCity);
        expect(result).to.deep.equal([actualCity, olderCity, oldCity]);
        expect(queryHook).to.not.have.been.called;
      });
    });
  });
});
