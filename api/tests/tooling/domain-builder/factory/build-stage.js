import { Stage } from '../../../../lib/domain/models/Stage.js';

const buildStage = function ({
  id = 123,
  title = 'Courage',
  message = 'Insister',
  threshold = 1,
  level = null,
  prescriberTitle = null,
  prescriberDescription = null,
  targetProfileId = null,
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
  });
};

export { buildStage };
