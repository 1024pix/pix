const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION,
  CURRENT_ATTENDANCE_SHEET_VERSION,
  getHeadersListByVersion,
} = require('../../infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');
const CertificationCandidate = require('../models/CertificationCandidate');
const _ = require('lodash');

module.exports = {
  extractCertificationCandidatesFromAttendanceSheet,
};

async function extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer }) {
  const headersListByVersion = getHeadersListByVersion(TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION);
  const version = await readOdsUtils.getOdsVersionByHeaders({ odsBuffer, headersListByVersion });
  switch (version) {
    case CURRENT_ATTENDANCE_SHEET_VERSION: {
      const transformationStruct = _.find(TRANSFORMATION_STRUCTS_FOR_PIX_CERTIF_CANDIDATES_IMPORT_BY_VERSION, { version }).struct;
      return handleCurrentVersion({ sessionId, odsBuffer, transformationStruct : transformationStruct });
    }
    default:
      break;
  }
}

async function handleCurrentVersion({ sessionId, odsBuffer, transformationStruct }) {
  let certificationCandidatesData = await readOdsUtils.extractTableDataFromOdsFile({
    odsBuffer,
    tableHeaderTargetPropertyMap: transformationStruct,
  });

  certificationCandidatesData = _filterOutEmptyCandidateData(certificationCandidatesData);

  const certificationCandidates = _.map(certificationCandidatesData, (certificationCandidateData) => {
    return new CertificationCandidate({ ...certificationCandidateData, sessionId });
  });

  _.each(certificationCandidates, (c) => c.validate());

  return certificationCandidates;
}

function _filterOutEmptyCandidateData(certificationCandidatesData) {
  return _(certificationCandidatesData).map(_nullifyObjectWithOnlyNilValues).compact().value();
}

function _nullifyObjectWithOnlyNilValues(data) {
  for (const propName in data) {
    if (!_.isNil(data[propName])) {
      return data;
    }
  }
  return null;
}
