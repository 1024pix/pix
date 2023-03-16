import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (results) {
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
};

export { serialize };
