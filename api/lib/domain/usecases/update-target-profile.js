import { validate } from '../validators/target-profile/base-validation.js';

const updateTargetProfile = async function ({
  id,
  name,
  imageUrl,
  description,
  comment,
  category,
  areKnowledgeElementsResettable,
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
    areKnowledgeElementsResettable,
  });
};

export { updateTargetProfile };
