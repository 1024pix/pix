const { TargetProfileInvalidError } = require('../errors');
const _ = require('lodash');

module.exports = async function createTargetProfile({ targetProfileData, targetProfileRepository, targetProfileWithLearningContentRepository }) {

  if (_.isEmpty(targetProfileData.skillsId)) {
    throw new TargetProfileInvalidError('Vous ne pouvez pas créer un profil cible sans acquis ciblés.');
  }

  const targetProfileId = await targetProfileRepository.create(targetProfileData);

  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
