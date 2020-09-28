const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION,
} = require('../../infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');
const CertificationCandidate = require('../models/CertificationCandidate');
const { CertificationCandidatesImportError } = require('../errors');
const _ = require('lodash');

module.exports = {
  extractCertificationCandidatesFromAttendanceSheet,
};

async function extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer }) {
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

  return _.map(certificationCandidatesDataByLine, (certificationCandidateData, line) => {
    let certificationCandidate;
    try {
      certificationCandidate = new CertificationCandidate({
        ...certificationCandidateData,
        sessionId,
      });
      certificationCandidate.validate(version);
    } catch (err) {
      _handleValidationError(err, tableHeaderTargetPropertyMap, line);
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

function _handleValidationError(err, tableHeaderTargetPropertyMap, line) {
  const keyLabelMap = tableHeaderTargetPropertyMap.reduce((acc, obj) => {
    acc[obj.property] = obj.header;
    return acc;
  }, {});
  line = parseInt(line) + 1;
  throw CertificationCandidatesImportError.fromInvalidCertificationCandidateError(err, keyLabelMap, line);
}

function _handleVersionError() {
  throw new CertificationCandidatesImportError({ message: 'La version du document est inconnue.' });
}

function _handleParsingError() {
  throw new CertificationCandidatesImportError({ message: 'Le document est invalide.' });
}
