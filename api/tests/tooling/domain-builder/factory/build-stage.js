const faker = require('faker');
const Stage = require('../../../../lib/domain/models/Stage');

module.exports = function buildStage({
  id = faker.random.uuid(),
  title = faker.company.catchPhrase(),
  message = faker.company.catchPhrase(),
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
