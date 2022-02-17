const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  getTransformationStructsForPixCertifCandidatesImport,
} = require('../../infrastructure/files/candidates-import/candidates-import-transformation-structures');
const CertificationCandidate = require('../models/CertificationCandidate');
const { CLEA, PIX_PLUS_DROIT } = require('../models/ComplementaryCertification');
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
  complementaryCertificationRepository,
  certificationCenterRepository,
}) {
  const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);
  const candidateImportStructs = getTransformationStructsForPixCertifCandidatesImport({
    complementaryCertifications: certificationCenter.habilitations,
  });
  try {
    await readOdsUtils.validateOdsHeaders({
      odsBuffer,
      headers: candidateImportStructs.headers,
    });
  } catch (err) {
    _handleVersionError();
  }
  const tableHeaderTargetPropertyMap = candidateImportStructs.transformStruct;
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

  return await bluebird.mapSeries(
    Object.entries(certificationCandidatesDataByLine),
    async ([line, certificationCandidateData]) => {
      let { sex, birthCountry, birthINSEECode, birthPostalCode, birthCity, billingMode } = certificationCandidateData;
      const { hasCleaNumerique, hasPixPlusDroit } = certificationCandidateData;

      if (certificationCandidateData.sex?.toUpperCase() === 'M') sex = 'M';
      if (certificationCandidateData.sex?.toUpperCase() === 'F') sex = 'F';

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

      const complementaryCertifications = await _buildComplementaryCertificationsForLine({
        hasCleaNumerique,
        hasPixPlusDroit,
        complementaryCertificationRepository,
      });

      if (billingMode) {
        billingMode = CertificationCandidate.translateBillingMode(billingMode);
      }

      const certificationCandidate = new CertificationCandidate({
        ...certificationCandidateData,
        birthCountry,
        birthINSEECode,
        birthPostalCode,
        birthCity,
        sex,
        sessionId,
        complementaryCertifications,
        billingMode,
      });

      try {
        certificationCandidate.validate();
      } catch (err) {
        _handleFieldValidationError(err, tableHeaderTargetPropertyMap, line);
      }

      return certificationCandidate;
    }
  );
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  return _(certificationCandidatesData)
    .mapValues(_nullifyObjectWithOnlyNilValues)
    .pickBy((value) => !_.isNull(value))
    .value();
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

async function _buildComplementaryCertificationsForLine({
  hasCleaNumerique,
  hasPixPlusDroit,
  complementaryCertificationRepository,
}) {
  const complementaryCertifications = [];
  const complementaryCertificationsInDB = await complementaryCertificationRepository.findAll();
  if (hasCleaNumerique) {
    complementaryCertifications.push(
      complementaryCertificationsInDB.find((complementaryCertification) => complementaryCertification.name === CLEA)
    );
  }
  if (hasPixPlusDroit) {
    complementaryCertifications.push(
      complementaryCertificationsInDB.find(
        (complementaryCertification) => complementaryCertification.name === PIX_PLUS_DROIT
      )
    );
  }
  return complementaryCertifications;
}
