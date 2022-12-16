const TargetProfileForCreation = require('../../../../lib/domain/models/TargetProfileForCreation');

module.exports = function buildTargetProfileForCreation({
  name = 'Profil cible super cool',
  category = 'some_category',
  description = 'description',
  comment = 'commentaire',
  isPublic = true,
  imageUrl = 'image/url',
  ownerOrganizationId = null,
  tubes = [{ id: 'recTubeId', level: 8 }],
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
  });
};
