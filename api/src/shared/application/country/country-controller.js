import { sharedUsecases } from '../../domain/usecases/index.js';
import * as countrySerializer from '../../infrastructure/serializers/jsonapi/country-serializer.js';

const findCountries = async function () {
  const countries = await sharedUsecases.findCountries();
  return countrySerializer.serialize(countries);
};

export const countryController = { findCountries };
