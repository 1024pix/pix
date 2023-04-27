const { validate } = require('../validators/target-profile/base-validation.js');

module.exports = async function updateTargetProfile({
  id,
  name,
  imageUrl,
  description,
  comment,
  category,
  targetProfileForUpdateRepository,
}) {
  validate({ name, imageUrl, description, comment, category });
  return targetProfileForUpdateRepository.update({
    targetProfileId: id,
    name,
    imageUrl,
    description,
    comment,
    category,
  });
};
