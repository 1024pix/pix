const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfile({
  id = databaseBuffer.getNextId(),
  name = 'Remplir un tableur',
  imageUrl = 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
  isPublic = true,
  isSimplifiedAccess = false,
  ownerOrganizationId,
  createdAt = new Date('2020-01-01'),
  outdated = false,
  description = null,
  comment = null,
  category = 'OTHER',
  migration_status = 'N/A',
} = {}) {
  ownerOrganizationId = _.isUndefined(ownerOrganizationId) ? buildOrganization().id : ownerOrganizationId;

  const values = {
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    ownerOrganizationId,
    createdAt,
    outdated,
    description,
    comment,
    category,
    migration_status,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
};
