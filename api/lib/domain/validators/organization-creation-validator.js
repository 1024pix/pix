const userValidator = require('./user-validator');
const organizationValidator = require('./organization-validator');
const { OrganizationCreationValidationErrors } = require('../../domain/errors');

function _concatErrors(userValidationErrors, organizationValidationErrors) {
  const validationErrors = [];
  if (userValidationErrors instanceof Array) {
    validationErrors.push(...userValidationErrors);
  }
  if (organizationValidationErrors instanceof Array) {
    validationErrors.push(...organizationValidationErrors);
  }
  return validationErrors;
}

// FIXME move it in the "future" Use Case that creates a User
module.exports = {

  validate(user, organization) {
    return Promise.all([
      userValidator.validate(user).catch((errors) => errors),
      organizationValidator.validate(organization).catch((errors) => errors),
    ])
      .then(values => {
        const userValidationErrors = values[0];
        const organizationValidationErrors = values[1];

        const validationErrors = _concatErrors(userValidationErrors, organizationValidationErrors);

        if (validationErrors.length > 0) {
          return Promise.reject(new OrganizationCreationValidationErrors(validationErrors));
        }

        return Promise.resolve();
      });
  }

};
