const { Serializer } = require('jsonapi-serializer');
const tutorialAttributes = require('./tutorial-attributes.js');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-analysis', {
      attributes: ['campaignTubeRecommendations'],
      campaignTubeRecommendations: {
        ref: 'id',
        includes: true,
        attributes: [
          'tubeId',
          'competenceId',
          'competenceName',
          'tubePracticalTitle',
          'areaColor',
          'averageScore',
          'tutorials',
          'tubeDescription',
        ],
        tutorials: tutorialAttributes,
      },
    }).serialize(results);
  },
};
