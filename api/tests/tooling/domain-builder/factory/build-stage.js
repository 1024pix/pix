const Stage = require('../../../../lib/domain/models/Stage');

module.exports = function buildStage({
  id = 123,
  title = 'Courage',
  message = 'Insister',
  threshold = 1,
  prescriberTitle,
  prescriberDescription,
} = {}) {

  return new Stage({
    id,
    title,
    message,
    threshold,
    prescriberTitle,
    prescriberDescription,
  });
};
