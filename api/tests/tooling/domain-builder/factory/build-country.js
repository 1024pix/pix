import { Country } from '../../../../lib/shared/domain/read-models/Country.js';
import { normalizeAndSortChars } from '../../../../lib/shared/infrastructure/utils/string-utils.js';

const buildCountry = function ({ code = '99345', name = 'TOGO', matcher = normalizeAndSortChars(name) } = {}) {
  return new Country({
    code,
    name,
    matcher,
  });
};

export { buildCountry };
