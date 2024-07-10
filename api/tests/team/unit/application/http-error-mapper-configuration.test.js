import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { teamDomainErrorMappingConfiguration } from '../../../../src/team/application/http-error-mapper-configuration.js';
import {
  AlreadyExistingAdminMemberError,
  UncancellableOrganizationInvitationError,
} from '../../../../src/team/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Team | Application | HttpErrorMapperConfiguration', function () {
  it('instantiates UnprocessableEntityError when UncancellableOrganizationInvitationError', async function () {
    //given
    const httpErrorMapper = teamDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === UncancellableOrganizationInvitationError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new UncancellableOrganizationInvitationError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.UnprocessableEntityError);
  });

  it('instantiates UnprocessableEntityError when AlreadyExistingAdminMemberError', async function () {
    //given
    const httpErrorMapper = teamDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === AlreadyExistingAdminMemberError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new AlreadyExistingAdminMemberError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.UnprocessableEntityError);
  });
});
