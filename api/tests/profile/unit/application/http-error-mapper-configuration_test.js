import { profileDomainErrorMappingConfiguration } from '../../../../src/profile/application/http-error-mapper-configuration.js';
import {
  AttestationNotFoundError,
  ProfileRewardCantBeSharedError,
  RewardTypeDoesNotExistError,
} from '../../../../src/profile/domain/errors.js';
import {
  BadRequestError,
  NotFoundError,
  PreconditionFailedError,
} from '../../../../src/shared/application/errors/http-errors.js';
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
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('instantiates PreconditionFailedError when ProfileRewardCantBeShared', async function () {
    //given
    const httpErrorMapper = profileDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === ProfileRewardCantBeSharedError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new ProfileRewardCantBeSharedError());

    //then
    expect(error).to.be.instanceOf(PreconditionFailedError);
  });

  it('instantiates BadRequestError when RewardTypeDoesNotExistError', async function () {
    //given
    const httpErrorMapper = profileDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === RewardTypeDoesNotExistError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new RewardTypeDoesNotExistError());

    //then
    expect(error).to.be.instanceOf(BadRequestError);
  });
});
