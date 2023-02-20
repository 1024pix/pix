import TargetProfileForCreation from '../../../../lib/domain/models/TargetProfileForCreation';

export default function buildTargetProfileForCreation({
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
}
