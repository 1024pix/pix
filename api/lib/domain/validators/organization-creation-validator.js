const userValidator = require('./user-validator');
const organizationValidator = require('./organization-validator');
const errors = require('../../domain/errors');

function _manageEmailAvailabilityError(error) {
  if(error instanceof errors.AlreadyRegisteredEmailError) {
    return new errors.EntityValidationError({
      invalidAttributes: [{ attribute: 'email', message: 'Cette adresse electronique est déjà enregistrée.' }]
    });
  }

  throw error;
}

// FIXME move it in the "future" Use Case that creates an organization, like create user
module.exports = {

  validate(user, organization, userRepository) {
    return Promise.all([
      userRepository.isEmailAvailable(user.email).catch(_manageEmailAvailabilityError),
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
