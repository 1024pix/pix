import { profileDomainErrorMappingConfiguration } from '../../../../src/profile/application/http-error-mapper-configuration.js';
import { AttestationNotFoundError } from '../../../../src/profile/domain/errors.js';
import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { expect } from '../../../test-helper.js';

describe('Profile | Unit | Application | HttpErrorMapperConfiguration', function () {
  it('instantiates NotFoundError when AttestationNotFoundError', async function () {
    //given
    const httpErrorMapper = profileDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === AttestationNotFoundError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new AttestationNotFoundError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.NotFoundError);
  });
});
