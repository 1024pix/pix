const { sanitizeAndSortChars } = require('../../infrastructure/utils/string-utils');
const isEmpty = require('lodash/isEmpty');

const CpfValidationStatus = {
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
};

class CpfBirthInformationValidation {
  constructor({ message, status, countryName, INSEECode, postalCode, cityName }) {
    this.message = message;
    this.status = status;
    this.countryName = countryName;
    this.INSEECode = INSEECode;
    this.postalCode = postalCode;
    this.cityName = cityName;
  }

  static failure(message) {
    return new CpfBirthInformationValidation({ message, status: CpfValidationStatus.FAILURE });
  }

  static success({ countryName, INSEECode, postalCode, cityName }) {
    return new CpfBirthInformationValidation({ countryName, INSEECode, postalCode, cityName, status: CpfValidationStatus.SUCCESS });
  }

  hasFailed() {
    return this.status === CpfValidationStatus.FAILURE;
  }
}

async function getBirthInformation({
  countryName,
  cityName,
  postalCode,
  INSEECode,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  if (!countryName) {
    return CpfBirthInformationValidation.failure('Le champ pays est obligatoire.');
  }

  const matcher = sanitizeAndSortChars(countryName);
  const country = await certificationCpfCountryRepository.getByMatcher({ matcher });

  if (!country) {
    return CpfBirthInformationValidation.failure(`Le pays ${countryName} n'a pas été trouvé.`);
  }

  if (!INSEECode && !postalCode) {
    return CpfBirthInformationValidation.failure('Le champ code postal ou code INSEE doit être renseigné.');
  }

  if (country.isForeign()) {
    if (!cityName) {
      return CpfBirthInformationValidation.failure('Le champ ville est obligatoire.');
    }

    return CpfBirthInformationValidation.success({
      countryName: country.commonName,
      INSEECode: country.code,
      postalCode: null,
      cityName,
    });
  }

  if (INSEECode) {
    const cities = await certificationCpfCityRepository.findByINSEECode({ INSEECode });

    if (isEmpty(cities)) {
      return CpfBirthInformationValidation.failure(`Le code INSEE ${INSEECode} n'est pas valide.`);
    }

    return CpfBirthInformationValidation.success({
      countryName: country.commonName,
      INSEECode,
      postalCode: null,
      cityName: _getActualCityName(cities),
    });
  }

  if (postalCode) {
    const cities = await certificationCpfCityRepository.findByPostalCode({ postalCode });

    if (isEmpty(cities)) {
      return CpfBirthInformationValidation.failure(`Le code postal ${postalCode} n'est pas valide.`);
    }

    const sanitizedCityName = sanitizeAndSortChars(cityName);
    const doesCityMatchPostalCode = cities.some((city) => sanitizeAndSortChars(city.name) === sanitizedCityName);

    if (!doesCityMatchPostalCode) {
      return CpfBirthInformationValidation.failure(`Le code postal ${postalCode} ne correspond pas à la ville ${cityName}`);
    }

    return CpfBirthInformationValidation.success({
      countryName: country.commonName,
      INSEECode: null,
      postalCode,
      cityName: _getActualCityName(cities),
    });
  }
}

function _getActualCityName(cities) {
  const actualCity = cities.find((city) => city.isActualName);
  return actualCity.name;
}

module.exports = {
  getBirthInformation,
  CpfBirthInformationValidation,
};
