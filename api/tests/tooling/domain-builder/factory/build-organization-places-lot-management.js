const OrganizationPlacesLotManagement = require('../../../../lib/domain/read-models/OrganizationPlacesLotManagement');

function buildOrganizationPlacesLotManagement({
  id,
  count,
  organizationId,
  activationDate,
  expirationDate,
  reference,
  category,
  creatorLastName,
  creatorFirstName,
  createdAt,
} = {}) {
  return new OrganizationPlacesLotManagement({
    id,
    count,
    organizationId,
    activationDate,
    expirationDate,
    reference,
    category,
    creatorLastName,
    creatorFirstName,
    createdAt,
  });
}

module.exports = buildOrganizationPlacesLotManagement;
