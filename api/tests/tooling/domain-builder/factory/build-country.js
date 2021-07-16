const { Country } = require('../../../../lib/domain/read-models/Country');
const { sanitizeAndSortChars } = require('../../../../lib/infrastructure/utils/string-utils');

module.exports = function buildCountry({
  code = '99345',
  name = 'TOGO',
  matcher = sanitizeAndSortChars(name),
} = {}) {

  return new Country({
    code,
    name,
    matcher,
  });
};
