import databaseBuffer from '../database-buffer';

function buildStage({
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
}

buildStage.withLevel = function ({
  id,
  message,
  title,
  level = 3,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {
  return buildStage({
    id,
    message,
    title,
    level,
    threshold: null,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  });
};

export default buildStage;
