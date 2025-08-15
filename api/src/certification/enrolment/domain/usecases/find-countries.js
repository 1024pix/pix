import * as injectedCountryRepository from '../../infrastructure/repositories/country-repository.js'; /**
 * @typedef {import('./index.js').CountryRepository} CountryRepository
 */

/**
 * @param {Object} params
 * @param {CountryRepository} params.countryRepository
 */
const findCountries = function ({ countryRepository = injectedCountryRepository } = {}) {
  return countryRepository.findAll();
};

export { findCountries };
