const { ObjectValidationError } = require('../errors');

module.exports = {

  validateEntity(schema, entity) {
    const { error } = schema.validate(entity);
    if (error) {
      throw new ObjectValidationError(error);
    }
  }
};
