const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const { UserNotAuthorizedToAccessEntityError } = require('../errors');
const HigherSchoolingRegistrationParser = require('../../infrastructure/serializers/csv/higher-schooling-registration-parser');
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

module.exports = async function getSchoolingRegistrationsCsvTemplate({
  userId,
  organizationId,
  membershipRepository,
}) {
  let header = [];
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true });

  if (!_isAdminOrganizationManagingStudent(membership)) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to download csv template.');
  }

  const { isSup, isSco, isAgriculture } = membership.organization;

  if (isSup) {
    header = _getCsvColumns(HigherSchoolingRegistrationParser.COLUMNS);
  } else if (isSco && isAgriculture) {
    header = _getCsvColumns(SchoolingRegistrationParser.COLUMNS);
  } else {
    throw new UserNotAuthorizedToAccessEntityError('User organization is not allowed to download csv template.');
  }

  //Create HEADER of CSV
  return _createHeaderOfCSV(header);
};

function _getCsvColumns(columns) {
  return columns.map((column) => column.label);
}

function _createHeaderOfCSV(header) {
  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  return '\uFEFF' + csvSerializer.serializeLine(header);
}

function _isAdminOrganizationManagingStudent(membership) {
  return membership && membership.isAdmin && membership.organization.isManagingStudents;
}
