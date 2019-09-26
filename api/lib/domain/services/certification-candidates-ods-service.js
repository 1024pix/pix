const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const { ATTENDANCE_SHEET_CANDIDATES_TABLE_HEADERS } = require('./../../infrastructure/files/attendance-sheet/attendance-sheet-candidates-table-headers');
const CertificationCandidate = require('../models/CertificationCandidate');
const _ = require('lodash');

module.exports = {
  extractCertificationCandidatesFromAttendanceSheet,
};

async function extractCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer }) {
  let certificationCandidatesData;
  certificationCandidatesData = await readOdsUtils.extractTableDataFromOdsFile({
    odsBuffer,
    tableHeaderTargetPropertyMap: ATTENDANCE_SHEET_CANDIDATES_TABLE_HEADERS,
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
