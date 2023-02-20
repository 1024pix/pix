import buildOrganization from './build-organization';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildTargetProfile({
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
}
