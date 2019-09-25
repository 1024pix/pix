const odsService = require('./ods-service');
const { ATTENDANCE_SHEET_HEADERS_AND_TRANSFORM_FUNCTIONS_ADMIN } = require('./../../infrastructure/files/attendance-sheet/attendance-sheet-candidates-table-headers');
const _ = require('lodash');

module.exports = {
  extractCertificationsDataFromAttendanceSheet,
};

async function extractCertificationsDataFromAttendanceSheet({ odsBuffer }) {
  let certificationsData;
  certificationsData = await odsService.extractTableDataFromOdsFile({
    odsBuffer,
    tableHeaderTargetPropertyMap: ATTENDANCE_SHEET_HEADERS_AND_TRANSFORM_FUNCTIONS_ADMIN,
  });

  certificationsData = _filterOutEmptyCertificationData(certificationsData);
  return _.reject(certificationsData, { 'lastName': null });
}

function _filterOutEmptyCertificationData(certificationData) {
  return _(certificationData).map(_nullifyObjectWithOnlyNilValues).compact().value();
}

function _nullifyObjectWithOnlyNilValues(data) {
  for (const propName in data) {
    if (!_.isNil(data[propName])) {
      return data;
    }
  }
  return null;
}
