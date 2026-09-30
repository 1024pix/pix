// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { createLRUCache } from '../../../../shared/infrastructure/caches/lru-cache.js';
import { CertificationCpfCountry } from '../../../shared/domain/models/CertificationCpfCountry.js';

const COUNTRIES_BY_MATCHER_CACHE = createLRUCache({ max: 20 });

/**
 * @function
 * @param {object} params
 * @param {string} params.matcher
 * @returns {Promise<CertificationCpfCountry | null> }
 */
export async function getByMatcher({ matcher }) {
  const cachedCountry = COUNTRIES_BY_MATCHER_CACHE.get(matcher);
  if (cachedCountry !== undefined) {
    return cachedCountry;
  }
  const knexConn = DomainTransaction.getConnection();
  const COLUMNS = ['id', 'code', 'commonName', 'originalName', 'matcher'];

  const result = await knexConn.select(COLUMNS).from('certification-cpf-countries').where({ matcher }).first();

  if (!result) {
    return null;
  }

  const country = new CertificationCpfCountry(result);

  COUNTRIES_BY_MATCHER_CACHE.set(matcher, country);
  return country;
}

export function clearCache() {
  COUNTRIES_BY_MATCHER_CACHE.clear();
}
