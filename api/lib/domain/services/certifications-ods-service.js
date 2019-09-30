const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  TRANSFORMATION_STRUCTS_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING_BY_VERSION,
  CURRENT_ATTENDANCE_SHEET_VERSION,
} = require('../../infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');
const _ = require('lodash');

module.exports = {
  extractCertificationsDataFromAttendanceSheet,
};

async function extractCertificationsDataFromAttendanceSheet({ odsBuffer }) {
  let certificationsData;
  const transformationStruct = _.find(TRANSFORMATION_STRUCTS_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING_BY_VERSION, { version: CURRENT_ATTENDANCE_SHEET_VERSION }).struct;
  certificationsData = await readOdsUtils.extractTableDataFromOdsFile({
    odsBuffer,
    tableHeaderTargetPropertyMap: transformationStruct,
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
