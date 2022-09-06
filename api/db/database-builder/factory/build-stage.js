const databaseBuffer = require('../database-buffer');

module.exports = function buildStage({
  id = databaseBuffer.getNextId(),
  message = 'Courage !',
  title = 'Encouragement, il en a bien besoin',
  level = null,
  threshold = 10,
  targetProfileId,
  prescriberTitle = null,
  prescriberDescription = null,
} = {}) {
  const values = {
    id,
    message,
    title,
    level,
    threshold,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'stages',
    values,
  });
};
