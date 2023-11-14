import { Stage } from '../../../../src/evaluation/domain/models/Stage.js';

/**
 * @param id
 * @param {string} title
 * @param {string} message
 * @param {number} threshold
 * @param {number} level
 * @param {string} prescriberTitle
 * @param {string} prescriberDescription
 * @param {number} targetProfileId
 * @param {boolean} isFirstSkill
 *
 * @returns {Stage}
 */
const buildStage = function ({
  id = 123,
  title = 'Courage',
  message = 'Insister',
  threshold = 1,
  level = null,
  prescriberTitle = null,
  prescriberDescription = null,
  targetProfileId = null,
  isFirstSkill = false,
} = {}) {
  return new Stage({
    id,
    title,
    message,
    threshold,
    level,
    prescriberTitle,
    prescriberDescription,
    targetProfileId,
    isFirstSkill,
  });
};

export { buildStage };
