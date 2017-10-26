import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';

import refTimedChallengeBis from '../data/challenges/ref-timed-challenge-bis';

export default function(schema, request) {

  // case 1 : we're trying to reach the first challenge for a given assessment
  if (!request.params.challengeId) {
    switch (request.params.assessmentId) {
      case 'ref_assessment_id':
        return refQcmChallengeFull;
      default:
        throw new Error('This assessment is not defined ' + request.params.assessmentId);
    }
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

  const challenge = nextChallenge[request.params.challengeId];

  if (challenge) {
    return challenge;
  }else {
    throw new Error('There is no challenge following challenge ' + request.params.challengeId);
  }

}
