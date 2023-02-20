import csvSerializer from '../../infrastructure/serializers/csv/csv-serializer';
import { UserNotAuthorizedToAccessEntityError } from '../errors';
import SupOrganizationLearnerImportHeader from '../../infrastructure/serializers/csv/sup-organization-learner-import-header';

export default async function getOrganizationLearnersCsvTemplate({
  userId,
  organizationId,
  i18n,
  membershipRepository,
}) {
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
    includeOrganization: true,
  });

  if (!_isAdminOrganizationManagingStudent(membership)) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to download csv template.');
  }

  const header = _getCsvColumns(new SupOrganizationLearnerImportHeader(i18n).columns);

  return _createHeaderOfCSV(header);
}

function _getCsvColumns(columns) {
  return columns.map((column) => column.name);
}

function _createHeaderOfCSV(header) {
  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  return '\uFEFF' + csvSerializer.serializeLine(header);
}

function _isAdminOrganizationManagingStudent(membership) {
  return (
    membership && membership.isAdmin && membership.organization.isManagingStudents && membership.organization.isSup
  );
}
