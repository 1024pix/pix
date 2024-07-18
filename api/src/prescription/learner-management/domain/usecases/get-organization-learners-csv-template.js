import * as csvSerializer from '../../../../../lib/infrastructure/serializers/csv/csv-serializer.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { SupOrganizationLearnerImportHeader } from '../../infrastructure/serializers/csv/sup-organization-learner-import-header.js';

const ERROR_MESSAGE = 'User is not allowed to download csv template.';

const getOrganizationLearnersCsvTemplate = async function ({
  userId,
  organizationId,
  i18n,
  membershipRepository,
  organizationLearnerImportFormatRepository,
}) {
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
    includeOrganization: true,
  });
  if (!_isAdminOrganization(membership)) {
    throw new UserNotAuthorizedToAccessEntityError(ERROR_MESSAGE);
  }
  const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);
  let columns;
  if (importFormat) {
    columns = importFormat.headersFields;
  } else {
    if (!_isSupManagingStudents(membership)) {
      throw new UserNotAuthorizedToAccessEntityError(ERROR_MESSAGE);
    }

    columns = new SupOrganizationLearnerImportHeader(i18n).columns;
  }

  const header = _getCsvColumns(columns);

  return _createHeaderOfCSV(header);
};

export { getOrganizationLearnersCsvTemplate };

function _getCsvColumns(columns) {
  return columns.map((column) => column.name);
}

function _createHeaderOfCSV(header) {
  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  return '\uFEFF' + csvSerializer.serializeLine(header);
}

function _isAdminOrganization(membership) {
  return membership?.isAdmin;
}

function _isSupManagingStudents(membership) {
  return membership?.organization.isManagingStudents && membership?.organization.isSup;
}
