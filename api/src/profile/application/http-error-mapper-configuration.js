import {
  BadRequestError,
  NotFoundError,
  PreconditionFailedError,
} from '../../shared/application/errors/http-errors.js';
import {
  AttestationNotFoundError,
  NoProfileRewardsFoundError,
  ProfileRewardCantBeSharedError,
  RewardTypeDoesNotExistError,
} from '../domain/errors.js';

const profileDomainErrorMappingConfiguration = [
  {
    name: AttestationNotFoundError.name,
    httpErrorFn: (error) => {
      return new NotFoundError(error.message, error.code, error.meta);
    },
  },
  {
    name: NoProfileRewardsFoundError.name,
    httpErrorFn: (error) => {
      return new NotFoundError(error.message, error.code, error.meta);
    },
  },
  {
    name: ProfileRewardCantBeSharedError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
  {
    name: RewardTypeDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new BadRequestError(error.message, error.code, error.meta);
    },
  },
];

export { profileDomainErrorMappingConfiguration };
