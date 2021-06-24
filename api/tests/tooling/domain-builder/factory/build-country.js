const { Country } = require('../../../../lib/domain/read-models/Country');

module.exports = function buildCountry({
  code = '99345',
  name = 'TOGO',
} = {}) {

  return new Country({
    code,
    name,
  });
};
