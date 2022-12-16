const { Country } = require('../../../../lib/domain/read-models/Country');
const { normalizeAndSortChars } = require('../../../../lib/infrastructure/utils/string-utils');

module.exports = function buildCountry({ code = '99345', name = 'TOGO', matcher = normalizeAndSortChars(name) } = {}) {
  return new Country({
    code,
    name,
    matcher,
  });
};
