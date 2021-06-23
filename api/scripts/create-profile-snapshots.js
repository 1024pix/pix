const _ = require('lodash');

async function main() {

}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = {
  createProfileSnapshot,
};

function createProfileSnapshot({
  userId,
  knowledgeElements,
  competences,
  scoringService
}) {
  const scorecards = competences.map((competence) => {
    const {
      realTotalPixScoreForCompetence,
      pixScoreForCompetence,
      currentLevel,
      pixAheadForNextLevel,
    } = scoringService.calculateScoringInformationForCompetence({ knowledgeElements, allowExcessPix: false, allowExcessLevel: false });

    return {
      id: `${userId}_${competence.id}`,
      competenceId: competence.id,
      earnedPix: pixScoreForCompetence,
    };
  });

  const pixScore = _.sumBy(scorecards, 'earnedPix');

  return {
    pixScore,
    scorecards,
  };
}
