import { normalizeAndSortChars } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import lodash from 'lodash';

const { isEmpty } = lodash;

import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';

const CpfValidationStatus = {
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
};

class CpfBirthInformationValidation {
  constructor({ birthCountry, birthINSEECode, birthPostalCode, birthCity, errors = [] } = { errors: [] }) {
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
    this.errors = errors;
  }

  get status() {
    return this.errors.length === 0 ? CpfValidationStatus.SUCCESS : CpfValidationStatus.FAILURE;
  }

  failure({ certificationCandidateError, data }) {
    const message = certificationCandidateError.getMessage(data);
    this.errors.push({ message, code: certificationCandidateError.code });
  }

  success({ birthCountry, birthINSEECode, birthPostalCode, birthCity }) {
    this.birthCountry = birthCountry;
    this.birthINSEECode = birthINSEECode;
    this.birthPostalCode = birthPostalCode;
    this.birthCity = birthCity;
  }

  hasFailed() {
    return this.status === CpfValidationStatus.FAILURE;
  }

  get firstErrorMessage() {
    return this.errors?.[0]?.message;
  }

  get firstErrorCode() {
    return this.errors?.[0]?.code;
  }
}

function _getForeignCountryBirthInformation({
  birthCity,
  birthINSEECode,
  birthPostalCode,
  country,
  cpfBirthInformationValidation,
}) {
  if (!birthCity) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_BIRTH_CITY_REQUIRED,
    });
  }

  if (birthPostalCode) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_POSTAL_CODE_MUST_BE_EMPTY,
    });
  }

  if (birthINSEECode !== '99') {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
    });
  }

  if (!cpfBirthInformationValidation.hasFailed()) {
    cpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode: country.code,
      birthPostalCode: null,
      birthCity,
    });
  }
}

async function _getBirthInformationByINSEECode({
  birthINSEECode,
  country,
  cpfBirthInformationValidation,
  certificationCpfCityRepository,
}) {
  const cities = await certificationCpfCityRepository.findByINSEECode({ INSEECode: birthINSEECode });

  if (isEmpty(cities)) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID,
      data: { birthINSEECode },
    });
  }

  if (!cpfBirthInformationValidation.hasFailed()) {
    cpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode,
      birthPostalCode: null,
      birthCity: _getActualCity(cities),
    });
  }
}

async function _getBirthInformationByPostalCode({
  birthCity,
  birthPostalCode,
  country,
  cpfBirthInformationValidation,
  certificationCpfCityRepository,
}) {
  const cities = await certificationCpfCityRepository.findByPostalCode({ postalCode: birthPostalCode });
  if (isEmpty(cities)) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND,
      data: { birthPostalCode },
    });
    return;
  }

  const normalizedAndSortedCity = normalizeAndSortChars(birthCity);
  const matchedCity = cities.find((city) => normalizeAndSortChars(city.name) === normalizedAndSortedCity);

  if (!matchedCity) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID,
      data: { birthPostalCode, birthCity },
    });
  }

  if (!cpfBirthInformationValidation.hasFailed()) {
    cpfBirthInformationValidation.success({
      birthCountry: country.commonName,
      birthINSEECode: null,
      birthPostalCode,
      birthCity: matchedCity.name,
    });
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
  const cpfBirthInformationValidation = new CpfBirthInformationValidation({
    birthCountry,
    birthCity,
    birthPostalCode,
    birthINSEECode,
  });

  if (!birthCountry && !birthINSEECode && !birthPostalCode && !birthCity) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INFORMATION_REQUIRED,
    });
    return cpfBirthInformationValidation;
  }

  if (!birthCountry) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_REQUIRED,
    });
    return cpfBirthInformationValidation;
  }

  const foundCountry = await _getCountry({ birthCountry, certificationCpfCountryRepository });
  if (!foundCountry) {
    cpfBirthInformationValidation.failure({
      certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_NOT_FOUND,
      data: { birthCountry },
    });
    return cpfBirthInformationValidation;
  }

  if (foundCountry.isForeign()) {
    _getForeignCountryBirthInformation({
      birthCity,
      birthINSEECode,
      birthPostalCode,
      country: foundCountry,
      cpfBirthInformationValidation,
    });
  } else {
    if (
      (!birthINSEECode && !birthPostalCode && !birthCity) ||
      (birthINSEECode && birthPostalCode) ||
      (birthINSEECode && birthCity)
    ) {
      cpfBirthInformationValidation.failure({
        certificationCandidateError:
          CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_AND_BIRTH_CITY_REQUIRED,
      });
      return cpfBirthInformationValidation;
    }

    if (birthCity && !birthPostalCode) {
      cpfBirthInformationValidation.failure({
        certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED,
      });
      return cpfBirthInformationValidation;
    }

    if (!birthCity && birthPostalCode) {
      cpfBirthInformationValidation.failure({
        certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
      });
      return cpfBirthInformationValidation;
    }

    if (birthINSEECode) {
      await _getBirthInformationByINSEECode({
        birthINSEECode,
        country: foundCountry,
        cpfBirthInformationValidation,
        certificationCpfCityRepository,
      });
    }

    if (birthPostalCode) {
      await _getBirthInformationByPostalCode({
        birthCity,
        birthPostalCode,
        country: foundCountry,
        cpfBirthInformationValidation,
        certificationCpfCityRepository,
      });
    }
  }

  return cpfBirthInformationValidation;
}

async function _getCountry({ birthCountry, certificationCpfCountryRepository }) {
  const matcher = normalizeAndSortChars(birthCountry);
  return certificationCpfCountryRepository.getByMatcher({ matcher });
}

function _getActualCity(cities) {
  const actualCity = cities.find((city) => city.isActualName);
  return actualCity.name;
}

export { getBirthInformation, CpfBirthInformationValidation, CpfValidationStatus };
