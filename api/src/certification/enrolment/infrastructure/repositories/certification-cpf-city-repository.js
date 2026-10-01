// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { createLRUCache } from '../../../../shared/infrastructure/caches/lru-cache.js';
import { CertificationCpfCity } from '../../../shared/domain/models/CertificationCpfCity.js';

const COLUMNS = ['id', 'name', 'postalCode', 'INSEECode', 'isActualName'];

const CITIES_BY_POSTALCODE = createLRUCache({ max: 1000 });
const CITIES_BY_INSEECODE = createLRUCache({ max: 1000 });

/**
 * @function
 * @param {object} params
 * @param {number} params.INSEECode
 * @returns {Promise<Array<CertificationCpfCity>> }
 */
export async function findByINSEECode({ INSEECode }) {
  const cachedCities = CITIES_BY_INSEECODE.get(INSEECode);
  if (cachedCities !== undefined) {
    return cachedCities;
  }
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(COLUMNS)
    .from('certification-cpf-cities')
    .where({ INSEECode })
    .orderBy('isActualName', 'desc')
    .orderBy('id');

  const cities = result.map((city) => new CertificationCpfCity(city));
  if (cities.length > 0) {
    CITIES_BY_INSEECODE.set(INSEECode, cities);
  }
  return cities;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.postalCode
 * @returns {Promise<Array<CertificationCpfCity>> }
 */
export async function findByPostalCode({ postalCode }) {
  const cachedCities = CITIES_BY_POSTALCODE.get(postalCode);
  if (cachedCities !== undefined) {
    return cachedCities;
  }
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select(COLUMNS)
    .from('certification-cpf-cities')
    .where({ postalCode })
    .orderBy('isActualName', 'desc')
    .orderBy('id');

  const cities = result.map((city) => new CertificationCpfCity(city));
  if (cities.length > 0) {
    CITIES_BY_POSTALCODE.set(postalCode, cities);
  }
  return cities;
}

export function clearCache() {
  CITIES_BY_POSTALCODE.clear();
  CITIES_BY_INSEECODE.clear();
}
