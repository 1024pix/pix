import { Country } from '../../../../lib/domain/read-models/Country.js';
import { normalizeAndSortChars } from '../../../../src/shared/infrastructure/utils/string-utils.js';

const buildCountry = function ({ code = '99345', name = 'TOGO', matcher = normalizeAndSortChars(name) } = {}) {
  return new Country({
    code,
    name,
    matcher,
  });
};

export { buildCountry };
