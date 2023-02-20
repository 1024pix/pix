import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(results) {
    return new Serializer('campaign-collective-result', {
      attributes: ['campaignCompetenceCollectiveResults'],
      campaignCompetenceCollectiveResults: {
        ref: 'id',
        includes: true,
        attributes: [
          'competenceId',
          'competenceName',
          'areaCode',
          'areaColor',
          'targetedSkillsCount',
          'averageValidatedSkills',
        ],
      },
    }).serialize(results);
  },
};
