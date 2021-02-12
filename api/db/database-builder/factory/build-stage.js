const databaseBuffer = require('../database-buffer');

module.exports = function buildStage({
  id = databaseBuffer.getNextId(),
  message = 'Courage !',
  title = 'Encouragement, il en a bien besoin',
  threshold = 10,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {

  const values = {
    id,
    message,
    title,
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
