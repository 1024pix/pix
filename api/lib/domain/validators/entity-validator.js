const { ObjectValidationError } = require('../errors.js');

module.exports = {
  validateEntity(schema, entity) {
    const { error } = schema.validate(entity);
    if (error) {
      throw new ObjectValidationError(error);
    }
  },
};
