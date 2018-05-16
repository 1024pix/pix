const userValidator = require('./user-validator');
const organizationValidator = require('./organization-validator');
const { AlreadyRegisteredEmailError, EntityValidationError } = require('../../domain/errors');

function _manageEmailAvailabilityError(error) {
  if(error instanceof AlreadyRegisteredEmailError) {
    return new EntityValidationError({
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
      .then((results) => {
        // Promise.all returns the return value of all promises, even if the return value is undefined
        return results.filter((result) => result instanceof Error);
      }).then((validationErrors) => {
        if (validationErrors.length > 0) {
          throw EntityValidationError.fromMultipleEntityValidationErrors(validationErrors);
        }
      });
  }

};
