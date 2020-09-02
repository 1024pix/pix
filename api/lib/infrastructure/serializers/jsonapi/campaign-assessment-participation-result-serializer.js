const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignAssessmentParticipationResult) {
    return new Serializer('campaign-assessment-participation-results', {
      id: 'campaignParticipationId',
      attributes: [
        'campaignId',
        'competenceResults',
      ],
      typeForAttribute: (attribute) => {
        if (attribute === 'competenceResults') return 'campaign-assessment-participation-competence-results';
      },
      competenceResults: {
        ref: 'id',
        attributes: [
          'name',
          'index',
          'areaColor',
          'totalSkillsCount',
          'validatedSkillsCount',
        ],
      },
    }).serialize(campaignAssessmentParticipationResult);
  },
};
