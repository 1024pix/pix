import { Country } from '../../../../lib/domain/read-models/Country';
import { normalizeAndSortChars } from '../../../../lib/infrastructure/utils/string-utils';

export default function buildCountry({ code = '99345', name = 'TOGO', matcher = normalizeAndSortChars(name) } = {}) {
  return new Country({
    code,
    name,
    matcher,
  });
}
