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
    _handleError({ key: 'version', why: 'unknown' }, []);
  }
  const tableHeaderTargetPropertyMap = TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION[version].transformStruct;
  let certificationCandidatesDataByLine = null;
  try {
    certificationCandidatesDataByLine = await readOdsUtils.extractTableDataFromOdsFile({
      odsBuffer,
      tableHeaderTargetPropertyMap,
    });
  } catch (err) {
    _handleError(err, []);
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
      _handleError(err, tableHeaderTargetPropertyMap, line);
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

function _handleError(err, tableHeaderTargetPropertyMap, line) {
  const structWithKey = tableHeaderTargetPropertyMap.find((obj) => obj.property === err.key);
  const column = structWithKey ? structWithKey.header : 'none';
  line = parseInt(line) + 1;
  if (err.why === 'not_a_date' || err.why === 'date_format') {
    throw new CertificationCandidatesImportError(`Ligne ${line} : Le champ “Date de naissance” doit être au format jj/mm/aaaa.`);
  }
  if (err.why === 'email_format') {
    throw new CertificationCandidatesImportError(`Ligne ${line} : Le champ “Email” doit être au format email.`);
  }
  if (err.why === 'not_a_string') {
    throw new CertificationCandidatesImportError(`Ligne ${line} : Le champ “${column}” doit être une chaîne de caractères.`);
  }
  if (err.why === 'not_a_number') {
    throw new CertificationCandidatesImportError(`Ligne ${line} : Le champ “${column}” doit être un nombre.`);
  }
  if (err.why === 'required') {
    throw new CertificationCandidatesImportError(`Ligne ${line} : Le champ “${column}” est obligatoire.`);
  }
  if (err.key === 'version') {
    throw new CertificationCandidatesImportError('La version du document est inconnue.');
  }
  throw new CertificationCandidatesImportError();
}
