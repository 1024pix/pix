const _ = require('lodash');

const { UserNotFoundError } = require('../errors');
const UserCompetence = require('../../../lib/domain/models/UserCompetence');

const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../lib/infrastructure/repositories/challenge-repository');
const answerRepository = require('../../../lib/infrastructure/repositories/answer-repository');
const competenceRepository = require('../../../lib/infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');

const getProfileToCertifyV1 = _.partial(_getProfileToCertify, _getUserCompetencesAndCorrectlyAnsweredChallengesIdsV1);
const getProfileToCertifyV2 = _.partial(_getProfileToCertify, _getUserCompetencesAndCorrectlyAnsweredChallengesIdsV2);

function _getProfileToCertify(getUserCompetencesAndCorrectlyAnsweredChallengeIdsFn, userId, limitDate) {
  return getUserCompetencesAndCorrectlyAnsweredChallengeIdsFn({ userId, limitDate })
    .then(UserCompetence.getCertificationInputDatas(challengeRepository.list))
    .then(UserCompetence.updateWithChallenges);
}

async function _getUserCompetencesAndCorrectlyAnsweredChallengesIdsV1({ userId, limitDate }) {
  return UserCompetence.getWithCorrectlyAnsweredChallengesIdsV1({
    coursesFetcher: courseRepository.getAdaptiveCourses,
    competencesFetcher: _.memoize(competenceRepository.list),
    lastAssessmentsFetcher: _.memoize(_.partial(assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser, userId, limitDate)),
    correctAnswersFetcher: answerRepository.findCorrectAnswersByAssessmentId,
  });
}

async function _getUserCompetencesAndCorrectlyAnsweredChallengesIdsV2({ userId, limitDate }) {
  return UserCompetence.getWithCorrectlyAnsweredChallengesIdsV2({
    competencesFetcher: competenceRepository.list,
    knowledgeElementsByCompetenceFetcher: _.partial(knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId, { userId, limitDate }),
    challengeIdsFetcher: answerRepository.findChallengeIdsFromAnswerIds,
  });
}

function isUserExistingByEmail(email) {
  return userRepository
    .findByEmail(email)
    .then(() => true)
    .catch(() => {
      throw new UserNotFoundError();
    });
}

function isUserExistingById(id) {
  return userRepository.get(id)
    .then(() => true);
}

module.exports = {
  isUserExistingByEmail,
  isUserExistingById,
  getProfileToCertifyV1,
  getProfileToCertifyV2,
};
