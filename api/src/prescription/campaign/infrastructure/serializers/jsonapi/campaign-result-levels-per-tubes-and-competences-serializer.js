import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (results) {
  return new Serializer('campaign-result-levels-per-tubes-and-competences', {
    attributes: ['levelsPerTube', 'levelsPerCompetence', 'maxReachableLevel', 'meanReachedLevel'],
    levelsPerCompetence: {
      ref: 'id',
      includes: true,
      attributes: ['index', 'name', 'description', 'maxLevel', 'meanLevel'],
    },
    levelsPerTube: {
      ref: 'id',
      includes: true,
      attributes: ['competenceId', 'practicalTitle', 'practicalDescription', 'maxLevel', 'meanLevel'],
    },
  }).serialize(results);
};

export { serialize };
