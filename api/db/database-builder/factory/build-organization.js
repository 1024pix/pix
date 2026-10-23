import { COUNTRY_FRANCE_CODE } from '../../seeds/data/common/constants.js';
import { databaseBuffer } from '../database-buffer.ts';
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
  structureId = null,
  categoryId = null,
  networkId = null,
  parentStructureId = null,
  withoutStructure = false,
} = {}) {
  if (!administrationTeamId) {
    administrationTeamId = buildAdministrationTeam().id;
  }

  if (!organizationLearnerTypeId) {
    organizationLearnerTypeId = buildOrganizationLearnerType({ name: `Type pour organisation ${id}` }).id;
  }

  if (!structureId && !withoutStructure) {
    structureId = buildStructure({ categoryId }).id;
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

  const organization = databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  if (structureId) {
    buildFactStructure({ structureId, networkId, organizationId: id, parentStructureId });
  }

  return organization;
};

/**
 * Creates an organization attached to an existing network (organization + structure + fct_structure).
 *
 * @param {object} options
 * @param {number} options.networkId - Id of the network to attach the organization to
 * @param {number} [options.parentStructureId] - Id of the parent structure (null for a head organization)
 * @param {object} [options.organizationData] - Any parameter accepted by buildOrganization
 * @param {number} [options.categoryId] - optional structure category id
 * @returns {{ organization: object, structure: object }}
 */
const buildOrganizationInNetwork = function ({
  networkId,
  parentStructureId = null,
  organizationData = {},
  categoryId = null,
} = {}) {
  const structure = buildStructure({ categoryId });
  const organization = buildOrganization({
    ...organizationData,
    structureId: structure.id,
    networkId,
    parentStructureId,
  });
  return { organization, structure };
};

/**
 * Creates an organization with a structure attached (organization + structure + fct_structure).
 *
 * @param {object} options
 * @param {object} [options.organizationData] - Any parameter accepted by buildOrganization
 * @returns {{ organization: object, structure: object }}
 */
const buildOrganizationWithStructure = function ({ organizationData, categoryId } = {}) {
  const structure = buildStructure({ categoryId });
  const organization = buildOrganization({ ...organizationData, structureId: structure.id });
  return { organization, structure };
};

export { buildOrganization, buildOrganizationInNetwork, buildOrganizationWithStructure };
