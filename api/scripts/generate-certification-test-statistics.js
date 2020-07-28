const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../db/knex-database-connection');
const competenceRepository = require('../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../lib/infrastructure/repositories/challenge-repository');
const placementProfileService = require('../lib/domain/services/placement-profile-service');
const certificationChallengeService = require('../lib/domain/services/certification-challenges-service');

const USER_COUNT = ~~process.env.USER_COUNT || 100;
let currentCount = 0;

function makeRefDataFaster() {
  challengeRepository.list = _.memoize(challengeRepository.findOperative);
  competenceRepository.list = _.memoize(competenceRepository.list);
  competenceRepository.listPixCompetencesOnly = _.memoize(competenceRepository.listPixCompetencesOnly);
}

makeRefDataFaster();

async function _retrieveUserIds() {
  // eslint-disable-next-line no-restricted-syntax
  const result = await knex.raw(`
    SELECT "users"."id"
    FROM "users"
    JOIN "certification-courses" ON "certification-courses"."userId" = "users"."id"
    ORDER BY "users"."id" DESC
    LIMIT ${USER_COUNT};
  `);
  return _.map(result.rows, 'id');
}

async function _generateCertificationTest(userId, competences) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, competences });
  if (!placementProfile.isCertifiable()) {
    throw new Error('pas certifiable');
  }

  const certificationChallenges = await certificationChallengeService.pickCertificationChallenges(placementProfile);

  const certificationChallengesCountByCompetenceId = _.countBy(certificationChallenges, 'competenceId');

  return _.fromPairs(_.map(placementProfile.userCompetences, (userCompetence) => {
    if (userCompetence.isCertifiable()) {
      return [
        userCompetence.id,
        certificationChallengesCountByCompetenceId[userCompetence.id],
      ];
    }
    return [
      userCompetence.id,
      'non-certifiable',
    ];
  }));
}

function updateProgress() {
  ++currentCount;
  process.stdout.write('.');
}

async function main() {
  try {
    console.log(`Récupération de ${USER_COUNT} utilisateurs certifiables...`);
    const userIds = await _retrieveUserIds();
    console.log('Récupération OK');
    const competences = await competenceRepository.listPixCompetencesOnly();
    let nonCertifiableUserCount = 0;

    console.log('Génération des tests de certification : ');
    const certificationTestsByUser = _.compact(await bluebird.map(userIds, async (userId) => {
      try {
        const challengeCountByCompetence = await _generateCertificationTest(userId, competences);
        return {
          userId,
          challengeCountByCompetence,
        };
      } catch (err) {
        ++nonCertifiableUserCount;
        return null;
      }
      finally {
        updateProgress();
      }
    }, { concurrency: ~~process.env.CONCURRENCY || 10 }));

    console.log('\nGénération des tests de certification OK');

    console.log('Génération des statistiques...');
    const competenceIds = _.map(competences, 'id');
    const allChallengeCountByCompetence = _.map(certificationTestsByUser, 'challengeCountByCompetence');
    const challengeCountByCompetenceTotal = _.map(competenceIds, (competenceId) => {
      return [
        competenceId,
        _.countBy(allChallengeCountByCompetence, competenceId),
      ];
    });
    console.log('Utilisateurs non certifiables : ', nonCertifiableUserCount);
    console.log(_.fromPairs(challengeCountByCompetenceTotal));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}
