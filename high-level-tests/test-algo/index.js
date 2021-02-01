'use strict';
require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const smartRandom = require('../../api/lib/domain/services/smart-random/smart-random');
const dataFetcher = require('../../api/lib/domain/services/smart-random/data-fetcher');
const challengeRepository = require('../../api/lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../api/lib/infrastructure/repositories/skill-repository');
const improvementService = require('../../api/lib/domain/services/improvement-service');
const pickChallengeService = require('../../api/lib/domain/services/pick-challenge-service');

async function launch_test() {

  const argv = yargs(hideBin(process.argv))
    .option('competenceId', {
      type: 'string',
      description: 'L\'id de la compétence',
    })
    .demandOption(['competenceId'])
    .argv;

  const competenceId = argv.competenceId;
  const locale = 'fr';
  const lastAnswer = null;
  const allAnswers = [];
  const knowledgeElements = [];
  const assessment = {
    id: null,
    competenceId,
  };

  const knowledgeElementRepository = {
    findUniqByUserId: () => [],
  };
  const answerRepository = {
    findByAssessment: () => [],
  };
  const { targetSkills, challenges } = await dataFetcher.fetchForCompetenceEvaluations({
    assessment,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
  });

  const result = smartRandom.getPossibleSkillsForNextChallenge({
    knowledgeElements,
    challenges,
    targetSkills,
    lastAnswer,
    allAnswers,
    locale,
  });

  const challenge = pickChallengeService.pickChallenge({
    skills: result.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });
  console.log(challenge);

  process.exit(0);
}

launch_test();
