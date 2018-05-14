const userValidator = require('./user-validator');
const organizationValidator = require('./organization-validator');
const errors = require('../../domain/errors');

// FIXME move it in the "future" Use Case that creates an organization, like create user
module.exports = {

  validate(user, organization) {
    return Promise.all([
      userValidator.validate(user).catch((errors) => errors),
      organizationValidator.validate(organization).catch((errors) => errors),
    ])
      .then((validationErrors) => {
        // Promise.all returns the return value of all promises, even if the return value is undefined
        const relevantErrors = validationErrors.filter((error) => error instanceof Error);
        if (relevantErrors.length > 0) {
          throw errors.EntityValidationError.fromEntityValidationErrors(relevantErrors);
        }
      });
  }

};
