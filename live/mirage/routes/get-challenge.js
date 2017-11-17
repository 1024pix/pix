import _ from 'pix-live/utils/lodash-custom';

import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import refTimedChallengeFull from '../data/challenges/ref-timed-challenge';
import refTimedChallengeBisFull from '../data/challenges/ref-timed-challenge-bis';

export default function(schema, request) {

  const challengeId = request.params.id;

  const allChallenges = [
    refQcmChallengeFull,
    refQcuChallengeFull,
    refQrocChallengeFull,
    refQrocmChallengeFull,
    refTimedChallengeFull,
    refTimedChallengeBisFull
  ];

  const challenges = _.map(allChallenges, function(oneChallenge) {
    return { id: oneChallenge.data.id, obj: oneChallenge };
  });

  const challenge = _.find(challenges, { id: challengeId });

  if (challenge) {
    return challenge.obj;
  }
  return schema.challenges.find(challengeId);
}
