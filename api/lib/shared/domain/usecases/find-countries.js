const findCountries = function ({ countryRepository }) {
  return countryRepository.findAll();
};

export { findCountries };
