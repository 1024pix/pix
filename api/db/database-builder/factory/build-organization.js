const databaseBuffer = require('../database-buffer');

const buildOrganization = function buildOrganization({
  id = databaseBuffer.getNextId(),
  type = 'PRO',
  name = 'Observatoire de Pix',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = 'EXABC123',
  provinceCode = '66',
  isManagingStudents = false,
  credit = 0,
  canCollectProfiles = true,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  email = 'contact@example.net',
  documentationUrl = null,
  createdBy,
  showNPS = false,
  formNPSUrl = null,
  showSkills = false,
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
    canCollectProfiles,
    email,
    documentationUrl,
    createdBy,
    createdAt,
    updatedAt,
    showNPS,
    formNPSUrl,
    showSkills,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });
};

module.exports = buildOrganization;
