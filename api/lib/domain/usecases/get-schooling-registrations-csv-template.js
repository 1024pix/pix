const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const { UserNotAuthorizedToAccessEntityError } = require('../errors');
const HigherSchoolingRegistrationColumns = require('../../infrastructure/serializers/csv/higher-schooling-registration-columns');
const SchoolingRegistrationColumns = require('../../infrastructure/serializers/csv/schooling-registration-columns');

module.exports = async function getSchoolingRegistrationsCsvTemplate({
  userId,
  organizationId,
  i18n,
  membershipRepository,
}) {
  let header = [];
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true });

  if (!_isAdminOrganizationManagingStudent(membership)) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to download csv template.');
  }

  const { isSup, isSco, isAgriculture } = membership.organization;

  if (isSup) {
    header = _getCsvColumns(new HigherSchoolingRegistrationColumns(i18n).columns);

  } else if (isSco && isAgriculture) {
    header = _getCsvColumns(new SchoolingRegistrationColumns(i18n).columns);
  } else {
    throw new UserNotAuthorizedToAccessEntityError('User organization is not allowed to download csv template.');
  }

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
