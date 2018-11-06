const UserSummary = require('../../../lib/domain/models/UserSummary');

module.exports = function buildUser(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
  } = {}) {

  return new UserSummary({
    id, firstName, lastName, email,
  });
};
