import { ObjectValidationError } from '../../../src/shared/domain/errors.js';

const validateEntity = function (schema, entity) {
  const { error } = schema.validate(entity);
  if (error) {
    throw new ObjectValidationError(error);
  }
};

export { validateEntity };
