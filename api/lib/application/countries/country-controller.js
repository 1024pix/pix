const usecases = require('../../domain/usecases/index.js');
const countrySerializer = require('../../infrastructure/serializers/jsonapi/country-serializer.js');

module.exports = {
  async findCountries(_request, _h, dependencies = { countrySerializer }) {
    const countries = await usecases.findCountries();
    return dependencies.countrySerializer.serialize(countries);
  },
};
