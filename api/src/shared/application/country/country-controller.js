import { sharedUsecases } from '../../domain/usecases/index.js';
import { countrySerializer } from '../../infrastructure/serializers/jsonapi/country-serializer.js';

const findCountries = async function (_request, _h, dependencies = { countrySerializer }) {
  const countries = await sharedUsecases.findCountries();
  return dependencies.countrySerializer.serialize(countries);
};

const countryController = { findCountries };
export { countryController };
