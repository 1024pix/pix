const OrganizationPlace = require('../../../../lib/domain/read-models/OrganizationPlace');

function buildOrganizationPlace({
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
  return new OrganizationPlace({
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

module.exports = buildOrganizationPlace;
