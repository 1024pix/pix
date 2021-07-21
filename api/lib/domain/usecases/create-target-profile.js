const { TargetProfileInvalidError } = require('../errors');
const _ = require('lodash');
const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

module.exports = async function createTargetProfile({ targetProfileData, targetProfileRepository, targetProfileWithLearningContentRepository }) {

  if (_.isEmpty(targetProfileData.skillsId)) {
    throw new TargetProfileInvalidError('Vous ne pouvez pas créer un profil cible sans acquis ciblés.');
  }

  if (_.isEmpty(targetProfileData.imageUrl)) {
    targetProfileData.imageUrl = DEFAULT_IMAGE_URL;
  }

  const targetProfileId = await targetProfileRepository.create(targetProfileData);

  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
