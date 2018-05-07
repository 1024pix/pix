const { FormValidationError } = require('../errors');

module.exports = function({
  user,
  userRepository,
  userValidator,
}) {
  return Promise.all([
    userRepository.isEmailAvailable(user.email).catch(error => error),
    userValidator.validate(user).catch(error => error),
  ])
    .then((errors) => {
      const relevantErrors = errors.filter((x) => x ? true : false);
      if (relevantErrors) {
        throw new FormValidationError(relevantErrors);
      }
    });
};
