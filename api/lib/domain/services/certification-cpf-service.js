const { sanitizeAndSortChars } = require('../../infrastructure/utils/string-utils');
const isEmpty = require('lodash/isEmpty');

const CpfValidationStatus = {
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
};

class CpfBirthInformationValidation {
  constructor({ message, status, birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.message = message;
    this.status = status;
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
  }

  static failure(message) {
    return new CpfBirthInformationValidation({ message, status: CpfValidationStatus.FAILURE });
  }

  static success({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    return new CpfBirthInformationValidation({ birthCountry, birthINSEECode, birthPostalCode, birthCity, status: CpfValidationStatus.SUCCESS });
  }

  hasFailed() {
    return this.status === CpfValidationStatus.FAILURE;
  }
}

async function getBirthInformation({
  birthCountry,
  birthCity,
  birthPostalCode,
  birthINSEECode,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  if (!birthCountry) {
    return CpfBirthInformationValidation.failure('Le champ pays est obligatoire.');
  }

  const matcher = sanitizeAndSortChars(birthCountry);
  const country = await certificationCpfCountryRepository.getByMatcher({ matcher });

  if (!country) {
    return CpfBirthInformationValidation.failure(`Le pays "${birthCountry}" n'a pas été trouvé.`);
  }

  if (!birthINSEECode && !birthPostalCode) {
    return CpfBirthInformationValidation.failure('Le champ code postal ou code INSEE doit être renseigné.');
  }

  if (country.isForeign()) {
    if (!birthCity) {
      return CpfBirthInformationValidation.failure('Le champ ville est obligatoire.');
    }

    return CpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode: country.code,
      birthPostalCode: null,
      birthCity,
    });
  }

  if (birthINSEECode) {
    const cities = await certificationCpfCityRepository.findByINSEECode({ INSEECode: birthINSEECode });

    if (isEmpty(cities)) {
      return CpfBirthInformationValidation.failure(`Le code INSEE "${birthINSEECode}" n'est pas valide.`);
    }

    return CpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode,
      birthPostalCode: null,
      birthCity: _getActualCity(cities),
    });
  }

  if (birthPostalCode) {
    if (!birthCity) {
      return CpfBirthInformationValidation.failure('Le champ ville est obligatoire.');
    }

    const cities = await certificationCpfCityRepository.findByPostalCode({ postalCode: birthPostalCode });

    if (isEmpty(cities)) {
      return CpfBirthInformationValidation.failure(`Le code postal "${birthPostalCode}" n'est pas valide.`);
    }

    const sanitizedCity = sanitizeAndSortChars(birthCity);
    const doesCityMatchPostalCode = cities.some((city) => sanitizeAndSortChars(city.name) === sanitizedCity);

    if (!doesCityMatchPostalCode) {
      return CpfBirthInformationValidation.failure(`Le code postal "${birthPostalCode}" ne correspond pas à la ville "${birthCity}"`);
    }

    return CpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode: null,
      birthPostalCode,
      birthCity: _getActualCity(cities),
    });
  }
}

function _getActualCity(cities) {
  const actualCity = cities.find((city) => city.isActualName);
  return actualCity.name;
}

module.exports = {
  getBirthInformation,
  CpfBirthInformationValidation,
};
