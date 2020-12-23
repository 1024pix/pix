const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(infoChallenge) {
    return new Serializer('info-challenge', {
      attributes: [
        'type', 'solution', 'pixValue',
        'skillIds', 'skillNames',
        'tubeIds', 'tubeNames',
        'competenceIds', 'competenceNames',
        'areaIds', 'areaNames',
      ],
    }).serialize(infoChallenge);
  },
};
