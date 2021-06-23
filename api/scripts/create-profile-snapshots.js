const _ = require('lodash');
const { knex } = require('../db/knex-database-connection');
const KnowledgeElement = require('../lib/domain/models/KnowledgeElement');
const competenceRepository = require('../lib/infrastructure/repositories/competence-repository');
const scoringService = require('../lib/domain/services/scoring/scoring-service');

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
  createProfileSnapshotJSON,
};

function createProfileSnapshotJSON({
  userId,
  knowledgeElements,
  competences,
  scoringService,
}) {
  const scorecards = competences.map((competence) => {
    const {
      pixScoreForCompetence,
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

function _toKnowledgeElementCollection({ snapshot } = {}) {
  if (!snapshot) return null;
  return JSON.parse(snapshot).map((data) => new KnowledgeElement({
    ...data,
    createdAt: new Date(data.createdAt),
  }));
}

async function createProfileSnapshot(knowledgeElementSnapshot) {
  const userId = knowledgeElementSnapshot.userId;
  const knowledgeElements = _toKnowledgeElementCollection(knowledgeElementSnapshot);
  const competences = await competenceRepository.listPixCompetencesOnly();

  const snapshot = createProfileSnapshotJSON({ userId, knowledgeElements, competences, scoringService });
  const snappedAt = new Date();

  await knex('profile-snapshots').insert({ snappedAt, userId, snapshot, knowledgeElementsSnapshotId: knowledgeElementSnapshot.id });
}
