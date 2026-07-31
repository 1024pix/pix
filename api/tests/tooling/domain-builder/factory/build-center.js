import { Center, MatchingOrganization } from '../../../../src/organizational-entities/domain/models/Center.js';
import { types } from '../../../../src/organizational-entities/domain/models/Organization.js';
import { CenterTypes } from '../../../../src/organizational-entities/domain/read-models/CenterTypes.js';
const buildCenter = function ({
  id = 1,
  name = 'A Certif Center',
  type = CenterTypes.SUP,
  externalId = 'EX123',
  habilitations,
  features,
  matchingOrganization = null,
  createdAt,
} = {}) {
  return new Center({
    id,
    name,
    type,
    externalId,
    habilitations,
    features,
    matchingOrganization,
    createdAt,
  });
};

const buildMatchingOrganization = function ({
  id = 2,
  externalId = 'EX123',
  type = types.SCO,
  isManagingStudents = true,
}) {
  return new MatchingOrganization({
    id,
    externalId,
    type,
    isManagingStudents,
  });
};

export { buildCenter, buildMatchingOrganization };
