import { organizationalEntitiesDomainErrorMappingConfiguration } from '../../../../src/organizational-entities/application/http-error-mapper-configuration.js';
import { TagNotFoundError } from '../../../../src/organizational-entities/domain/errors.js';
import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../../src/shared/application/models/domain-error-mapping-configuration.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Organizational Entities | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    organizationalEntitiesDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(DomainErrorMappingConfiguration),
    );
  });

  context('when mapping "TagNotFoundError"', function () {
    it('returns an NotFoundError Http Error', function () {
      //given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === TagNotFoundError.name,
      );
      const meta = 'Test meta';

      //when
      const error = httpErrorMapper.httpErrorFn(new TagNotFoundError(meta));

      //then
      expect(error).to.be.instanceOf(HttpErrors.NotFoundError);
      expect(error.message).to.equal('Tag does not exist');
      expect(error.meta).to.equal(meta);
    });
  });
});
