import { usecases } from '../../domain/usecases/index.js';
import * as countrySerializer from '../../infrastructure/serializers/jsonapi/country-serializer.js';

const findCountries = async function (_request, _h, dependencies = { countrySerializer }) {
  const countries = await usecases.findCountries();
  return dependencies.countrySerializer.serialize(countries);
};

export { findCountries };
