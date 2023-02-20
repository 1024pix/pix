import usecases from '../../domain/usecases';
import countrySerializer from '../../infrastructure/serializers/jsonapi/country-serializer';

export default {
  async findCountries() {
    const countries = await usecases.findCountries();
    return countrySerializer.serialize(countries);
  },
};
