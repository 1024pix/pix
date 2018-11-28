const Tutorial = require('../../../lib/domain/models/Tutorial');

module.exports = function buildTutorial({
  id = 'recTuto1',
  duration = '00:01:30',
  format = 'video',
  link = 'https://youtube.fr',
  source = 'Youtube',
  title = 'Savoir regarder des vidéos youtube.'
} = {}) {
  return new Tutorial({
    id,
    duration,
    format,
    link,
    source,
    title
  });
};
