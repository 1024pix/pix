import { databaseBuffer } from '../database-buffer.js';

const buildTargetProfile = function ({
  id = databaseBuffer.getNextId(),
  name = 'Remplir un tableur',
  internalName = name || 'Remplir un tableur',
  imageUrl = 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
  isSimplifiedAccess = false,
  createdAt = new Date('2020-01-01'),
  outdated = false,
  description = null,
  comment = null,
  category = 'OTHER',
  migration_status = 'N/A',
  areKnowledgeElementsResettable = false,
} = {}) {
  const values = {
    id,
    name,
    internalName,
    imageUrl,
    isSimplifiedAccess,
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
