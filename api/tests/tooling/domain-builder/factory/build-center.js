import { Center, MatchingOrganization } from '../../../../src/certification/enrolment/domain/models/Center.js';
import { CenterTypes } from '../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { types } from '../../../../src/organizational-entities/domain/models/Organization.js';
const buildCenter = function ({
  id = 1,
  name = 'A Certif Center',
  type = CenterTypes.SUP,
  externalId = 'EX123',
  habilitations,
  features,
  matchingOrganization = null,
} = {}) {
  return new Center({
    id,
    name,
    type,
    externalId,
    habilitations,
    features,
    matchingOrganization,
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
