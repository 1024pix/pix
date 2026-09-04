import { COUNTRY_FRANCE_CODE } from '../../seeds/data/common/constants.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAdministrationTeam } from './build-administration-team.js';
import { buildFactStructure } from './build-fact-structure.js';
import { buildOrganizationLearnerType } from './build-organization-learner-type.js';
import { buildStructure } from './build-structure.js';

const buildOrganization = function buildOrganization({
  id = databaseBuffer.getNextId(),
  type = 'PRO',
  name = 'Observatoire de Pix',
  logoUrl = null,
  externalId = 'EXABC123',
  provinceCode = '66',
  isManagingStudents = false,
  credit = 0,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  email = 'contact@example.net',
  documentationUrl = null,
  createdBy = null,
  showNPS = false,
  formNPSUrl = null,
  showSkills = false,
  archivedBy = null,
  archivedAt = null,
  identityProviderForCampaigns = null,
  parentOrganizationId = null,
  administrationTeamId = null,
  countryCode = COUNTRY_FRANCE_CODE,
  organizationLearnerTypeId = null,
} = {}) {
  if (!administrationTeamId) {
    administrationTeamId = buildAdministrationTeam().id;
  }

  if (!organizationLearnerTypeId) {
    organizationLearnerTypeId = buildOrganizationLearnerType({ name: `Type pour organisation ${id}` }).id;
  }

  const values = {
    id,
    type,
    name,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    email,
    documentationUrl,
    createdBy,
    createdAt,
    updatedAt,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedBy,
    archivedAt,
    identityProviderForCampaigns,
    parentOrganizationId,
    administrationTeamId,
    countryCode,
    organizationLearnerTypeId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

/**
 * Creates an organization attached to an existing network (organization + structure + fct_structure).
 *
 * @param {object} options
 * @param {number} options.networkId - Id of the network to attach the organization to
 * @param {number} [options.parentStructureId] - Id of the parent structure (null for a head organization)
 * @param {object} [options.organizationData] - Any parameter accepted by buildOrganization
 * @param {number} [options.certificationCenterId] - optional certification center id to link to the organization
 * @returns {{ organization: object, structure: object }}
 */
const buildOrganizationInNetwork = function ({
  networkId,
  parentStructureId = null,
  organizationData = {},
  certificationCenterId = null,
} = {}) {
  const organization = buildOrganization(organizationData);
  const structure = buildStructure();
  buildFactStructure({
    structureId: structure.id,
    networkId,
    organizationId: organization.id,
    parentStructureId,
    certificationCenterId,
  });
  return { organization, structure };
};

/**
 * Creates an organization with a structure attached (organization + structure + fct_structure).
 *
 * @param {object} options
 * @param {object} [options.organizationData] - Any parameter accepted by buildOrganization
 * @param {number} [options.certificationCenterId] - optional certification center id to link to the organization
 * @returns {{ organization: object, structure: object }}
 */
const buildOrganizationWithStructure = function ({ organizationData, certificationCenterId, categoryId } = {}) {
  const organization = buildOrganization(organizationData);
  const structure = buildStructure({ categoryId });
  buildFactStructure({ structureId: structure.id, organizationId: organization.id, certificationCenterId });
  return { organization, structure };
};

export { buildOrganization, buildOrganizationInNetwork, buildOrganizationWithStructure };
