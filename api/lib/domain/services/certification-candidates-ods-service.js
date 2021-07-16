const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION,
} = require('../../infrastructure/files/candidates-import/candidates-import-transformation-structures');
const CertificationCandidate = require('../models/CertificationCandidate');
const { CertificationCandidatesImportError } = require('../errors');
const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = {
  extractCertificationCandidatesFromCandidatesImportSheet,
};

async function extractCertificationCandidatesFromCandidatesImportSheet({
  sessionId,
  odsBuffer,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  let version = null;
  try {
    version = await readOdsUtils.getOdsVersionByHeaders({
      odsBuffer,
      transformationStructsByVersion: _.orderBy(TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION, ['version'], ['desc']) });
  } catch (err) {
    _handleVersionError();
  }
  const tableHeaderTargetPropertyMap = TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION[version].transformStruct;
  let certificationCandidatesDataByLine = null;
  try {
    certificationCandidatesDataByLine = await readOdsUtils.extractTableDataFromOdsFile({
      odsBuffer,
      tableHeaderTargetPropertyMap,
    });
  } catch (err) {
    _handleParsingError(err);
  }

  certificationCandidatesDataByLine = _filterOutEmptyCandidateData(certificationCandidatesDataByLine);

  return await bluebird.mapSeries(Object.entries(certificationCandidatesDataByLine), async ([line, certificationCandidateData]) => {
    let {
      sex,
      birthCountry,
      birthINSEECode,
      birthPostalCode,
      birthCity,
    } = certificationCandidateData;

    if (version === '1.5') {
      if (certificationCandidateData.sex === '1') sex = 'M';
      if (certificationCandidateData.sex === '2') sex = 'F';

      const cpfBirthInformation = await certificationCpfService.getBirthInformation({
        ...certificationCandidateData,
        certificationCpfCityRepository,
        certificationCpfCountryRepository,
      });

      if (cpfBirthInformation.hasFailed()) {
        _handleBirthInformationValidationError(cpfBirthInformation, line);
      }

      birthCountry = cpfBirthInformation.birthCountry;
      birthINSEECode = cpfBirthInformation.birthINSEECode;
      birthPostalCode = cpfBirthInformation.birthPostalCode;
      birthCity = cpfBirthInformation.birthCity;
    }

    const certificationCandidate = new CertificationCandidate({
      ...certificationCandidateData,
      birthCountry,
      birthINSEECode,
      birthPostalCode,
      birthCity,
      sex,
      sessionId,
    });

    try {
      certificationCandidate.validate(version);
    } catch (err) {
      _handleFieldValidationError(err, tableHeaderTargetPropertyMap, line);
    }

    return certificationCandidate;
  });
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  return _(certificationCandidatesData).mapValues(_nullifyObjectWithOnlyNilValues).pickBy((value) => !_.isNull(value)).value();
}

function _nullifyObjectWithOnlyNilValues(data) {
  for (const propName in data) {
    if (!_.isNil(data[propName])) {
      return data;
    }
  }
  return null;
}

function _handleFieldValidationError(err, tableHeaderTargetPropertyMap, line) {
  const keyLabelMap = tableHeaderTargetPropertyMap.reduce((acc, obj) => {
    acc[obj.property] = obj.header;
    return acc;
  }, {});
  line = parseInt(line) + 1;
  throw CertificationCandidatesImportError.fromInvalidCertificationCandidateError(err, keyLabelMap, line);
}

function _handleBirthInformationValidationError(cpfBirthInformation, line) {
  line = parseInt(line) + 1;
  throw new CertificationCandidatesImportError({ message: `Ligne ${line} : ${cpfBirthInformation.message}` });
}

function _handleVersionError() {
  throw new CertificationCandidatesImportError({
    code: 'INVALID_DOCUMENT',
    message: 'La version du document est inconnue.',
  });
}

function _handleParsingError() {
  throw new CertificationCandidatesImportError({ code: 'INVALID_DOCUMENT', message: 'Le document est invalide.' });
}
