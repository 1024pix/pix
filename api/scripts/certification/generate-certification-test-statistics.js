const dotenv = require('dotenv');
dotenv.config();

const _ = require('lodash');
const fp = require('lodash/fp').convert({ cap: false });
const bluebird = require('bluebird');
const { knex, disconnect } = require('../../db/knex-database-connection');
const competenceRepository = require('../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../lib/infrastructure/repositories/challenge-repository');
const placementProfileService = require('../../lib/domain/services/placement-profile-service');
const certificationChallengeService = require('../../lib/domain/services/certification-challenges-service');
const { FRENCH_FRANCE } = require('../../lib/domain/constants').LOCALE;

const USER_COUNT = parseInt(process.env.USER_COUNT) || 100;
const USER_ID = parseInt(process.env.USER_ID) || null;

// Exemple d'utilisation :
// $ LOG_ENABLED=FALSE PGSSLMODE=require NODE_TLS_REJECT_UNAUTHORIZED='0' USER_COUNT=1000 node scripts/generate-certification-test-statistics.js > branch.log
//
// Voir aussi :
// - https://1024pix.atlassian.net/wiki/spaces/DEV/pages/1855422507/2020-09-28+G+n+rer+des+stats+sur+les+tests+de+certif

function makeRefDataFaster() {
  challengeRepository.list = _.memoize(challengeRepository.findOperative);
  competenceRepository.list = _.memoize(competenceRepository.list);
  competenceRepository.listPixCompetencesOnly = _.memoize(competenceRepository.listPixCompetencesOnly);
}

makeRefDataFaster();

async function _retrieveUserIds() {
  const result = await knex.raw(
    `
    SELECT "users"."id"
    FROM "users"
    JOIN "certification-courses" ON "certification-courses"."userId" = "users"."id"
    ORDER BY "users"."id" DESC
    LIMIT ?;
  `,
    USER_COUNT
  );
  return _.map(result.rows, 'id');
}

async function _generateCertificationTest(userId, competences) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, competences });
  if (!placementProfile.isCertifiable()) {
    throw new Error('pas certifiable');
  }

  const certificationChallenges = await certificationChallengeService.pickCertificationChallenges(
    placementProfile,
    FRENCH_FRANCE
  );
  if (USER_ID) {
    console.log(JSON.stringify(certificationChallenges, null, 2));
  }

  fp.flow(
    fp.groupBy('competenceId'),
    fp.mapValues((ccs) => ccs.map((cc) => cc.associatedSkillName.slice(-1)).join(':')),
    fp.map((levels, competenceId) => `${userId}\t${competenceId}\t${levels}`),
    fp.sortBy(fp.identity),
    fp.forEach((line) => console.log(line))
  )(certificationChallenges);

  const certificationChallengesCountByCompetenceId = _.countBy(certificationChallenges, 'competenceId');

  return _.fromPairs(
    _.map(placementProfile.userCompetences, (userCompetence) => {
      if (userCompetence.isCertifiable()) {
        return [userCompetence.id, certificationChallengesCountByCompetenceId[userCompetence.id]];
      }
      return [userCompetence.id, 'non-certifiable'];
    })
  );
}

function updateProgress() {
  process.stderr.write('.');
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  let userIds;
  if (USER_ID) {
    console.error(`userId: ${USER_ID}`);
    userIds = [USER_ID];
  } else {
    console.error(`Récupération de ${USER_COUNT} utilisateurs certifiables...`);
    userIds = await _retrieveUserIds();
  }
  console.error('Récupération OK');
  const competences = await competenceRepository.listPixCompetencesOnly();
  let nonCertifiableUserCount = 0;

  console.error('Génération des tests de certification : ');
  const certificationTestsByUser = _.compact(
    await bluebird.mapSeries(
      userIds,
      async (userId) => {
        try {
          const challengeCountByCompetence = await _generateCertificationTest(userId, competences);
          return {
            userId,
            challengeCountByCompetence,
          };
        } catch (err) {
          console.error(`Erreur de génération pour le user : ${userId}`, err);
          ++nonCertifiableUserCount;
          return null;
        } finally {
          updateProgress();
        }
      },
      { concurrency: ~~process.env.CONCURRENCY || 10 }
    )
  );

  console.error('\nGénération des tests de certification OK');

  console.error('Génération des statistiques...');
  const competenceIds = _.map(competences, 'id');
  const allChallengeCountByCompetence = _.map(certificationTestsByUser, 'challengeCountByCompetence');
  const challengeCountByCompetenceTotal = _.map(competenceIds, (competenceId) => {
    return [competenceId, _.countBy(allChallengeCountByCompetence, competenceId)];
  });
  console.log('Utilisateurs non certifiables : ', nonCertifiableUserCount);
  console.log(_.fromPairs(challengeCountByCompetenceTotal));
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
