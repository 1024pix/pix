import { profileDomainErrorMappingConfiguration } from '../../../../src/profile/application/http-error-mapper-configuration.js';
import {
  AttestationNotFoundError,
  ProfileRewardCantBeSharedError,
  RewardTypeDoesNotExistError,
} from '../../../../src/profile/domain/errors.js';
import { HttpErrors } from '../../../../src/shared/application/http-errors.js';

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

  it('instantiates PreconditionFailedError when ProfileRewardCantBeShared', async function () {
    //given
    const httpErrorMapper = profileDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === ProfileRewardCantBeSharedError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new ProfileRewardCantBeSharedError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.PreconditionFailedError);
  });

  it('instantiates BadRequestError when RewardTypeDoesNotExistError', async function () {
    //given
    const httpErrorMapper = profileDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === RewardTypeDoesNotExistError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new RewardTypeDoesNotExistError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
  });
});
