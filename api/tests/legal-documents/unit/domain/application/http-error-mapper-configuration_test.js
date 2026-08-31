import { expect } from 'chai';

import { legalDocumentsDomainErrorMappingConfiguration } from '../../../../../src/legal-documents/application/http-error-mapper-configuration.js';
import { LegalDocumentInvalidDateError } from '../../../../../src/legal-documents/domain/errors.js';
import { UnprocessableEntityError } from '../../../../../src/shared/application/errors/http-errors.js';

describe('Unit | Legal Documents | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "LegalDocumentInvalidDateError"', function () {
    it('returns an UnprocessableEntity Http Error', function () {
      //given
      const httpErrorMapper = legalDocumentsDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === LegalDocumentInvalidDateError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new LegalDocumentInvalidDateError());

      //then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
    });
  });
});
