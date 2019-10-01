const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const {
  TRANSFORMATION_STRUCTS_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING_BY_VERSION,
} = require('../../infrastructure/files/attendance-sheet/attendance-sheet-transformation-structures');
const _ = require('lodash');

module.exports = {
  extractCertificationsDataFromAttendanceSheet,
};

async function extractCertificationsDataFromAttendanceSheet({ odsBuffer }) {
  const version = await readOdsUtils.getOdsVersionByHeaders({
    odsBuffer,
    transformationStructsByVersion: _.orderBy(TRANSFORMATION_STRUCTS_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING_BY_VERSION, ['version'], ['desc']) });
  let certificationsData = await readOdsUtils.extractTableDataFromOdsFile({
    odsBuffer,
    tableHeaderTargetPropertyMap: TRANSFORMATION_STRUCTS_FOR_PIX_ADMIN_CERTIFICATIONS_PARSING_BY_VERSION[version].transformStruct,
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
