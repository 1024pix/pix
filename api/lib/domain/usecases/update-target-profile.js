import { NotFoundError } from '../../domain/errors.js';

const updateTargetProfile = async function ({
  id,
  attributesToUpdate,
  targetProfileForAdminRepository,
  targetProfileForUpdateRepository,
}) {
  let targetProfileToUpdate;

  try {
    targetProfileToUpdate = await targetProfileForAdminRepository.get({ id });
  } catch (err) {
    throw new NotFoundError("Ce profile cible n'existe pas");
  }

  const hasTubeToUpdate = attributesToUpdate.tubes?.length > 0;

  if (hasTubeToUpdate) {
    if (targetProfileToUpdate.hasLinkedCampaign) {
      throw new Error('Le profil cible est relié à une campagne, interdiction de modifier le référentiel');
    }

    return targetProfileForUpdateRepository.updateWithTubes(id, attributesToUpdate);
  }

  return targetProfileForUpdateRepository.update({
    targetProfileId: id,
    name: attributesToUpdate.name,
    imageUrl: attributesToUpdate.imageUrl,
    description: attributesToUpdate.description,
    comment: attributesToUpdate.comment,
    category: attributesToUpdate.category,
    areKnowledgeElementsResettable: attributesToUpdate.areKnowledgeElementsResettable,
  });
};

export { updateTargetProfile };
