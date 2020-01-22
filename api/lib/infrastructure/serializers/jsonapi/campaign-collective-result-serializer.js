const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(results) {
    return new Serializer('campaign-collective-result', {
      attributes: ['campaignCompetenceCollectiveResults'],
      campaignCompetenceCollectiveResults: {
        ref: 'id',
        includes: true,
        attributes: ['competenceId', 'competenceName', 'areaCode', 'areaColor', 'totalSkillsCount', 'averageValidatedSkills'],
      },
    }).serialize(results);
  },
};
