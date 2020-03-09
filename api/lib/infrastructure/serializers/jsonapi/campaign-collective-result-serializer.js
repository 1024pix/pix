const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-collective-result', {
      attributes: ['campaignCompetenceCollectiveResults', 'campaignTubeCollectiveResults'],
      campaignCompetenceCollectiveResults: {
        ref: 'id',
        includes: true,
        attributes: ['competenceId', 'competenceName', 'areaCode', 'areaColor', 'totalSkillsCount', 'averageValidatedSkills'],
      },
      campaignTubeCollectiveResults: {
        ref: 'id',
        includes: true,
        attributes: ['tubeId', 'tubePracticalTitle', 'areaColor', 'totalSkillsCount', 'averageValidatedSkills'],
      },
    }).serialize(results);
  },
};
