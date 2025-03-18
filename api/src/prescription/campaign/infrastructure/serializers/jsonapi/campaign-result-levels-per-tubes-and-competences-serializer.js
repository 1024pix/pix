import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (results) {
  return new Serializer('campaign-result-levels-per-tubes-and-competences', {
    attributes: [
      'campaignLevelsPerTube',
      'campaignLevelsPerCompetence',
      'campaignMaxReachableLevel',
      'campaignMeanReachedLevel',
    ],
    campaignLevelsPerCompetence: {
      ref: 'id',
      includes: true,
      attributes: ['index', 'name', 'description', 'maxLevel', 'meanLevel'],
    },
    campaignLevelsPerTube: {
      ref: 'id',
      includes: true,
      attributes: ['competenceId', 'practicalTitle', 'practicalDescription', 'maxLevel', 'meanLevel'],
    },
  }).serialize(results);
};

export { serialize };
