import { TargetProfileForCreation } from '../../../../src/shared/domain/models/TargetProfileForCreation.js';

const buildTargetProfileForCreation = function ({
  name = 'Profil cible super cool',
  category = 'some_category',
  description = 'description',
  comment = 'commentaire',
  isPublic = true,
  imageUrl = 'image/url',
  ownerOrganizationId = null,
  tubes = [{ id: 'recTubeId', level: 8 }],
  areKnowledgeElementsResettable = false,
} = {}) {
  return new TargetProfileForCreation({
    name,
    category,
    description,
    comment,
    isPublic,
    imageUrl,
    ownerOrganizationId,
    tubes,
    areKnowledgeElementsResettable,
  });
};

export { buildTargetProfileForCreation };
