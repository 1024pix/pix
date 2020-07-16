const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getSchoolingRegistrationsCsvTemplate({
  userId,
  organizationId,
  membershipRepository,
}) {
  const [membership] = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true });
  if (!_isAdminInSupOrganizationManagingStudents(membership)) {
    throw new UserNotAuthorizedToAccessEntity('User is not allowed to download csv template.');
  }

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV();

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  return '\uFEFF' + csvSerializer.serializeLine(headers);
};

function _createHeaderOfCSV() {
  return [
    'Premier prénom',
    'Deuxième prénom',
    'Troisième prénom',
    'Nom de famille',
    'Nom d’usage',
    'Date de naissance (jj/mm/aaaa)',
    'Email',
    'Numéro étudiant',
    'Composante',
    'Équipe pédagogique',
    'Groupe',
    'Diplôme',
    'Régime'
  ];
}

function _isAdminInSupOrganizationManagingStudents(membership) {
  return membership && membership.isAdmin && membership.organization.isManagingStudents && membership.organization.type === 'SUP';
}
