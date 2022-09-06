const StageForCreation = require('../../../../lib/domain/models/StageForCreation');

const buildStageForCreation = function ({
  title = 'mon titre',
  message = 'some_message',
  level = 3,
  threshold = null,
  targetProfileId = 123,
} = {}) {
  return new StageForCreation({
    title,
    message,
    level,
    threshold,
    targetProfileId,
  });
};

buildStageForCreation.withLevel = function ({ title, message, level, targetProfileId } = {}) {
  return buildStageForCreation({
    title,
    message,
    level,
    threshold: null,
    targetProfileId,
  });
};

buildStageForCreation.withThreshold = function ({ title, message, threshold, targetProfileId } = {}) {
  return buildStageForCreation({
    title,
    message,
    level: null,
    threshold,
    targetProfileId,
  });
};

module.exports = buildStageForCreation;
