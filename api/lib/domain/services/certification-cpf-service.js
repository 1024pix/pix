const { normalizeAndSortChars } = require('../../infrastructure/utils/string-utils.js');
const isEmpty = require('lodash/isEmpty');
const { CERTIFICATION_CANDIDATES_ERRORS } = require('../constants/certification-candidates-errors');

const CpfValidationStatus = {
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
};

class CpfBirthInformationValidation {
  constructor({ message, code, status, birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.message = message;
    this.status = status;
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
    this.code = code;
  }

  static failure({ certificationCandidateError, data }) {
    const message = certificationCandidateError.getMessage(data);
    return new CpfBirthInformationValidation({
      message,
      status: CpfValidationStatus.FAILURE,
      code: certificationCandidateError.code,
    });
  }

  static success({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    return new CpfBirthInformationValidation({
      birthCountry,
      birthINSEECode,
      birthPostalCode,
      birthCity,
      status: CpfValidationStatus.SUCCESS,
    });
  }

  hasFailed() {
    return this.status === CpfValidationStatus.FAILURE;
  }
}

function getForeignCountryBirthInformation(birthCity, birthINSEECode, birthPostalCode, country) {
  if (!birthCity) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
    });
  }

  if (birthPostalCode) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError:
        CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_POSTAL_CODE_ON_FOREIGN_COUNTRY_MUST_BE_EMPTY,
    });
  }

  if (!birthINSEECode || birthINSEECode !== '99') {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
    });
  }

  return CpfBirthInformationValidation.success({
    birthCountry: country.commonName,
    birthINSEECode: country.code,
    birthPostalCode: null,
    birthCity,
  });
}

async function getBirthInformationByINSEECode(birthCity, birthINSEECode, country, certificationCpfCityRepository) {
  if (birthCity) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError:
        CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
    });
  }

  const cities = await certificationCpfCityRepository.findByINSEECode({ INSEECode: birthINSEECode });

  if (isEmpty(cities)) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID,
      data: { birthINSEECode },
    });
  }

  return CpfBirthInformationValidation.success({
    birthCountry: country.commonName,
    birthINSEECode,
    birthPostalCode: null,
    birthCity: _getActualCity(cities),
  });
}

async function getBirthInformationByPostalCode(birthCity, birthPostalCode, country, certificationCpfCityRepository) {
  if (!birthCity) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
    });
  }

  const cities = await certificationCpfCityRepository.findByPostalCode({ postalCode: birthPostalCode });

  if (isEmpty(cities)) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND,
      data: { birthPostalCode },
    });
  }

  const normalizedAndSortedCity = normalizeAndSortChars(birthCity);
  const matchedCity = cities.find((city) => normalizeAndSortChars(city.name) === normalizedAndSortedCity);

  if (!matchedCity) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID,
      data: { birthPostalCode, birthCity },
    });
  }

  return CpfBirthInformationValidation.success({
    birthCountry: country.commonName,
    birthINSEECode: null,
    birthPostalCode,
    birthCity: matchedCity.name,
  });
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
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_REQUIRED,
    });
  }

  const matcher = normalizeAndSortChars(birthCountry);
  const country = await certificationCpfCountryRepository.getByMatcher({ matcher });

  if (!country) {
    return CpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_NOT_FOUND,
      data: { birthCountry },
    });
  }
  if (country.isForeign()) {
    return getForeignCountryBirthInformation(birthCity, birthINSEECode, birthPostalCode, country);
  } else {
    if (!birthINSEECode && !birthPostalCode && !birthCity) {
      return CpfBirthInformationValidation.failure({
        certificationCandidateError:
          CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
      });
    }

    if (birthINSEECode && birthPostalCode) {
      return CpfBirthInformationValidation.failure({
        certificationCandidateError:
          CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
      });
    }

    if (birthINSEECode) {
      return await getBirthInformationByINSEECode(birthCity, birthINSEECode, country, certificationCpfCityRepository);
    }

    if (birthPostalCode) {
      return await getBirthInformationByPostalCode(birthCity, birthPostalCode, country, certificationCpfCityRepository);
    }

    if (birthCity) {
      return CpfBirthInformationValidation.failure({
        certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED,
      });
    }
  }
}

function _getActualCity(cities) {
  const actualCity = cities.find((city) => city.isActualName);
  return actualCity.name;
}

module.exports = {
  getBirthInformation,
  CpfBirthInformationValidation,
  CpfValidationStatus,
};
