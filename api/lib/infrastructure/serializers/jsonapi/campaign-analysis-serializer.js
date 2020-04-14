const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-analysis', {
      attributes: ['campaignTubeRecommendations'],
      campaignTubeRecommendations: {
        ref: 'id',
        includes: true,
        attributes: ['tubeId', 'competenceId', 'competenceName', 'tubePracticalTitle', 'areaColor', 'averageScore'],
      },
    }).serialize(results);
  },
};
