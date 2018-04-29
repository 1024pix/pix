const userValidator = require('./user-validator');
const organizationValidator = require('./organization-validator');
const { OrganizationCreationValidationErrors } = require('../../domain/errors');

function _concatErrors(userDataErrors, organizationDataErrors) {
  const validationErrors = [];
  if (userDataErrors instanceof Array) {
    validationErrors.push(...userDataErrors);
  }
  if (organizationDataErrors instanceof Array) {
    validationErrors.push(...organizationDataErrors);
  }
  return validationErrors;
}

// FIXME move it in the "future" Use Case that creates a User
module.exports = {

  validate(userData, organizationData) {
    return Promise.all([
      userValidator.validate(userData).catch((errors) => errors),
      organizationValidator.validate(organizationData).catch((errors) => errors),
    ])
      .then(values => {
        const userDataErrors = values[0];
        const organizationErrors = values[1];

        const validationErrors = _concatErrors(userDataErrors, organizationErrors);

        if (validationErrors.length > 0) {
          return Promise.reject(new OrganizationCreationValidationErrors(validationErrors));
        }

        return Promise.resolve();
      });
  }

};
