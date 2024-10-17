import { HttpErrors } from '../../shared/application/http-errors.js';
import { AttestationNotFoundError } from '../domain/errors.js';

const profileDomainErrorMappingConfiguration = [
  {
    name: AttestationNotFoundError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.NotFoundError(error.message, error.code, error.meta);
    },
  },
];

export { profileDomainErrorMappingConfiguration };
