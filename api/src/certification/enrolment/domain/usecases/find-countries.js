/**
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 */

/**
 * @param {Object} params
 * @param {CountryRepository} params.countryRepository
 */
const findCountries = function ({ countryRepository }) {
  return countryRepository.findAll();
};

export { findCountries };
