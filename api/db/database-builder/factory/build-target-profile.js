const buildOrganization = require('./build-organization');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfile({
  id = databaseBuffer.getNextId(),
  name = 'Remplir un tableur',
  imageUrl = 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_GEN.svg',
  isPublic = true,
  isSimplifiedAccess = false,
  ownerOrganizationId,
  createdAt = new Date('2020-01-01'),
  outdated = false,
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
};
