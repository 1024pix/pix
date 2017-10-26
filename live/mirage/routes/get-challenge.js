import _ from 'pix-live/utils/lodash-custom';

import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import refTimedChallengeFull from '../data/challenges/ref-timed-challenge';
import refTimedChallengeBisFull from '../data/challenges/ref-timed-challenge-bis';

export default function(schema, request) {

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

  const challenge = _.find(challenges, { id: request.params.id });

  if (challenge) {
    return challenge.obj;
  }else {
    throw new Error('The challenge you required in the fake server does not exist ' + request.params.id);
  }

}
