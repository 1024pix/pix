import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';

import refTimedChallengeBis from '../data/challenges/ref-timed-challenge-bis';

function getNextChallengeForDynamicAssessment(assessment) {
  const course = assessment.course;
  const courseChallenges = course.challenges.models;

  const answers = assessment.answers.models;

  // When the assessment has just begun
  if (answers.length === 0) {
    return courseChallenges[0];
  }

  const lastAnswer = answers[answers.length - 1];
  const lastAnswerChallenge = lastAnswer.challenge;

  // when the last answered challenge was the course's last one
  const nextChallengeIndex = courseChallenges.findIndex(challenge => lastAnswerChallenge.id === challenge.id) + 1;
  if (nextChallengeIndex >= courseChallenges.length) {
    return null;
  }

  // when the last answered challenge was one of the course's normal one
  const nextChallenge = courseChallenges.objectAt(nextChallengeIndex);
  return nextChallenge;
}

function getNextChallengeForTestingAssessment(assessmentId, currentChallengeId) {
  // case 1 : we're trying to reach the first challenge for a given assessment
  if (!currentChallengeId) {
    return refQcmChallengeFull;
  }

  // case 2 : test already started, challenge exists.
  const nextChallenge = {

    // ref_course
    'ref_qcm_challenge_id': refQcuChallengeFull,
    'ref_qcu_challenge_id': refQrocChallengeFull,
    'ref_qroc_challenge_id': refQrocmChallengeFull,
    'ref_qrocm_challenge_id': 'null',

    'ref_timed_challenge_id': refTimedChallengeBis,
    'ref_timed_challenge_bis_id': 'null'
  };

  return nextChallenge[currentChallengeId];
}

export default function(schema, request) {

  const assessmentId = request.params.assessmentId;
  const currentChallengeId = request.params.challengeId;

  // dynamic assessment
  const assessment = schema.assessments.find(assessmentId);
  if (assessment) {
    return getNextChallengeForDynamicAssessment(assessment);
  }

  // testing assessment
  return getNextChallengeForTestingAssessment(assessmentId, currentChallengeId);
}
