import { ObjectValidationError } from '../errors';

export default {
  validateEntity(schema, entity) {
    const { error } = schema.validate(entity);
    if (error) {
      throw new ObjectValidationError(error);
    }
  },
};
