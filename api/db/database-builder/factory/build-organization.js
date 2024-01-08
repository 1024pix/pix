import { databaseBuffer } from '../database-buffer.js';

const buildOrganization = function buildOrganization({
  id = databaseBuffer.getNextId(),
  type = 'PRO',
  name = 'Observatoire de Pix',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
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
} = {}) {
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
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

export { buildOrganization };
