import { HttpErrors } from '../../../shared/application/http-errors.js';
import { TargetProfileCannotBeCreated } from '../domain/errors.js';

const targetProfileDomainErrorMappingConfiguration = [
  {
    name: TargetProfileCannotBeCreated.name,
    httpErrorFn: (error) => {
      return new HttpErrors.UnprocessableEntityError(error.message);
    },
  },
];

export { targetProfileDomainErrorMappingConfiguration };
