import { expect } from 'chai';
import sinon from 'sinon';

import * as certificationCpfCountryRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import { CertificationCpfCountry } from '../../../../../../src/certification/shared/domain/models/CertificationCpfCountry.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | certificationCpfCountryRepository', function () {
  let queryHook;
  beforeEach(function () {
    certificationCpfCountryRepository.clearCache();
    queryHook = sinon.stub();
    knex.addListener('query', queryHook);
  });

  afterEach(async function () {
    knex.removeListener('query', queryHook);
  });

  describe('#getByMatcher', function () {
    context('when the country exists', function () {
      it('should return the country', async function () {
        // given
        const country = domainBuilder.buildCertificationCpfCountry({
          id: 1,
          code: '99100',
          commonName: 'FRANCE',
          originalName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCountry(country);
        await databaseBuilder.commit();

        // when
        const result = await certificationCpfCountryRepository.getByMatcher({ matcher: country.matcher });

        // then
        expect(result).to.deep.equal(country);
        expect(result).to.be.instanceOf(CertificationCpfCountry);
      });
    });

    context('when the country does not exist', function () {
      it('should return null', async function () {
        // when
        const result = await certificationCpfCountryRepository.getByMatcher({ matcher: 'unknown_matcher' });

        // then
        expect(result).to.be.null;
      });
    });

    context('caching', function () {
      it('reads the value from the database when country with the given matcher is not cached', async function () {
        // given
        const country = domainBuilder.buildCertificationCpfCountry({
          id: 1,
          code: '99100',
          commonName: 'FRANCE',
          originalName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCountry(country);
        await databaseBuilder.commit();
        queryHook.reset();

        // when
        const result = await certificationCpfCountryRepository.getByMatcher({ matcher: country.matcher });

        // then
        expect(result).to.deep.equal(country);
        expect(queryHook).to.have.been.calledOnce;
      });

      it('reads the value from the cache when country with the given matcher is cached', async function () {
        // given
        const country = domainBuilder.buildCertificationCpfCountry({
          id: 1,
          code: '99100',
          commonName: 'FRANCE',
          originalName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCountry(country);
        await databaseBuilder.commit();
        await certificationCpfCountryRepository.getByMatcher({ matcher: country.matcher });
        queryHook.reset();

        // when
        const result = await certificationCpfCountryRepository.getByMatcher({ matcher: country.matcher });

        // then
        expect(result).to.deep.equal(country);
        expect(queryHook).to.not.have.been.called;
      });
    });
  });
});
