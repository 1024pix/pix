import { PreconditionFailedError } from '../../../shared/application/errors/http-errors.js';
import { StageModificationForbiddenForLinkedTargetProfileError } from '../domain/errors.js';

const stagesDomainErrorMappingConfiguration = [
  {
    name: StageModificationForbiddenForLinkedTargetProfileError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message);
    },
  },
];

export { stagesDomainErrorMappingConfiguration };
