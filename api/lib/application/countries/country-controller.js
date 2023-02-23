const usecases = require('../../domain/usecases/index.js');
const countrySerializer = require('../../infrastructure/serializers/jsonapi/country-serializer');

module.exports = {
  async findCountries() {
    const countries = await usecases.findCountries();
    return countrySerializer.serialize(countries);
  },
};
