const { NotFoundError } = require('../errors');
module.exports = async function getTargetProfileTemplate({ targetProfileTemplateId, targetProfileRepository }) {
  const targetProfileTemplate = await targetProfileRepository.getTargetProfileTemplate({ id: targetProfileTemplateId });
  if (!targetProfileTemplate) {
    throw new NotFoundError(`No target profile template for ID ${targetProfileTemplateId}`);
  }
  return targetProfileTemplate;
};
