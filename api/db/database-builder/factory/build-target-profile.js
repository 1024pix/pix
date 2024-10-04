import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';

const buildTargetProfile = function ({
  id = databaseBuffer.getNextId(),
  name = 'Remplir un tableur',
  imageUrl = 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
  isSimplifiedAccess = false,
  ownerOrganizationId,
  createdAt = new Date('2020-01-01'),
  outdated = false,
  description = null,
  comment = null,
  category = 'OTHER',
  migration_status = 'N/A',
  areKnowledgeElementsResettable = false,
} = {}) {
  ownerOrganizationId = _.isUndefined(ownerOrganizationId) ? buildOrganization().id : ownerOrganizationId;

  const values = {
    id,
    name,
    imageUrl,
    isSimplifiedAccess,
    ownerOrganizationId,
    createdAt,
    outdated,
    description,
    comment,
    category,
    migration_status,
    areKnowledgeElementsResettable,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles',
    values,
  });
};

export { buildTargetProfile };
