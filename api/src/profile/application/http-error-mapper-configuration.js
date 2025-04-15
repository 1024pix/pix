import { HttpErrors } from '../../shared/application/http-errors.js';
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
      return new HttpErrors.NotFoundError(error.message, error.code, error.meta);
    },
  },
  {
    name: NoProfileRewardsFoundError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.NotFoundError(error.message, error.code, error.meta);
    },
  },
  {
    name: ProfileRewardCantBeSharedError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
  {
    name: RewardTypeDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
    },
  },
];

export { profileDomainErrorMappingConfiguration };
