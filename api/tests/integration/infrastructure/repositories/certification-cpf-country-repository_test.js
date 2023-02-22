import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import certificationCpfCountryRepository from '../../../../lib/infrastructure/repositories/certification-cpf-country-repository';
import CertificationCpfCountry from '../../../../lib/domain/models/CertificationCpfCountry';

describe('Integration | Repository | certificationCpfCountryRepository', function () {
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
  });
});
