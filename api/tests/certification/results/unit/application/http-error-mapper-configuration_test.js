import {
  parcoursupDomainErrorMappingConfiguration,
  resultsDomainErrorMappingConfiguration,
} from '../../../../../src/certification/results/application/http-error-mapper-configuration.js';
import {
  CertificateGenerationError,
  MoreThanOneMatchingCertificationError,
  NoCertificationResultForDivision,
} from '../../../../../src/certification/results/domain/errors.js';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Results | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "MoreThanOneMatchingCertificationError"', function () {
    it('returns an ConflictError Http Error', function () {
      //given
      const httpErrorMapper = parcoursupDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === MoreThanOneMatchingCertificationError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new MoreThanOneMatchingCertificationError());

      //then
      expect(error).to.be.instanceOf(ConflictError);
      expect(error.message).to.equal('More than one candidate found for current search parameters');
    });
  });

  context('when mapping "NoCertificationResultForDivision"', function () {
    it('returns an NotFoundError Http Error', function () {
      //given
      const httpErrorMapper = resultsDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === NoCertificationResultForDivision.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new NoCertificationResultForDivision());

      //then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Aucun résultat de certification pour cette classe.');
    });
  });

  context('when mapping "CertificateGenerationError"', function () {
    it('returns an UnprocessableEntityError Http Error', function () {
      //given
      const httpErrorMapper = resultsDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificateGenerationError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificateGenerationError());

      //then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('An error has occurred during PDF generation');
    });
  });
});
