import { configurationDomainErrorMappingConfiguration } from '../../../../../src/certification/configuration/application/http-error-mapper-configuration.js';
import {
  CertificationVersionDraftAlreadyExistError,
  InvalidScoWhitelistError,
} from '../../../../../src/certification/configuration/domain/errors.js';
import { BadRequestError, UnprocessableEntityError } from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Configuration | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "InvalidScoWhitelistError"', function () {
    it('returns an UnprocessableEntity Http Error', function () {
      //given
      const httpErrorMapper = configurationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === InvalidScoWhitelistError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new InvalidScoWhitelistError());

      //then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('La liste blanche contient des données invalides.');
    });
  });

  context('when mapping "CertificationVersionDraftAlreadyExistError"', function () {
    it('returns an BadRequest Http Error', function () {
      //given
      const httpErrorMapper = configurationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationVersionDraftAlreadyExistError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationVersionDraftAlreadyExistError());

      //then
      expect(error).to.be.instanceOf(BadRequestError);
      expect(error.message).to.equal(
        "Il est interdit de créer une nouvelle version lorsqu'il y en a déjà une en cours d'édition",
      );
    });
  });
});
