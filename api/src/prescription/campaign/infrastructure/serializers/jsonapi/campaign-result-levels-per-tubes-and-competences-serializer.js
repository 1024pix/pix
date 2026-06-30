import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (results, isCampaignParticipation = false) {
  const serializerName = isCampaignParticipation
    ? 'campaign-participation-levels-per-tubes-and-competences'
    : 'campaign-result-levels-per-tubes-and-competences';
  return new Serializer(serializerName, {
    attributes: ['levelsPerCompetence', 'maxReachableLevel', 'meanReachedLevel'],
    transform(results) {
      const levelsPerCompetence = results.levelsPerCompetence.map((competence) => {
        const levelsPerTube = results.levelsPerTube.filter((tube) => tube.competenceId === competence.id);

        return {
          ...competence,
          maxLevel: competence.maxLevel.toFixed(1),
          meanLevel: competence.meanLevel.toFixed(1),
          levelsPerTube: levelsPerTube.map((levelPerTube) => {
            return {
              ...levelPerTube,
              maxLevel: levelPerTube.maxLevel.toFixed(1),
              meanLevel: levelPerTube.meanLevel.toFixed(1),
            };
          }),
        };
      }, []);

      return {
        id: results.id,
        maxReachableLevel: results.maxReachableLevel.toFixed(1),
        meanReachedLevel: results.meanReachedLevel.toFixed(1),
        levelsPerCompetence,
      };
    },
    levelsPerCompetence: {
      ref: 'id',
      includes: true,
      attributes: ['index', 'name', 'description', 'maxLevel', 'meanLevel', 'levelsPerTube'],
      levelsPerTube: {
        ref: 'id',
        includes: true,
        attributes: ['competenceId', 'competenceName', 'title', 'description', 'maxLevel', 'meanLevel'],
      },
    },
  }).serialize(results);
};

export const campaignResultLevelsPerTubesAndCompetencesSerializer = { serialize };
