const Training = require('../../../../lib/domain/models/Training');

module.exports = function buildTraining({
  id = 'training1',
  title = 'Training 1',
  link = 'https://example.net',
  type = 'webinar',
  duration = {
    hours: 5,
  },
  locale = 'fr-fr',
  targetProfileIds = [1],
} = {}) {
  return new Training({
    id,
    title,
    link,
    type,
    duration,
    locale,
    targetProfileIds,
  });
};
