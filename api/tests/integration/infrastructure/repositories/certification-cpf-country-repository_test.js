const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certificationCpfCountryRepository = require('../../../../lib/infrastructure/repositories/certification-cpf-country-repository');
const CertificationCpfCountry = require('../../../../lib/domain/models/CertificationCpfCountry');

describe('Integration | Repository | certificationCpfCountryRepository', () => {

  describe('#getByMatcher', () => {

    context('when the country exists', () => {

      it('should return the country', async () => {
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

    context('when the country does not exist', () => {

      it('should return null', async () => {
        // when
        const result = await certificationCpfCountryRepository.getByMatcher({ matcher: 'unknown_matcher' });

        // then
        expect(result).to.be.null;
      });
    });
  });
});
