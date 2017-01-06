import _ from 'pix-live/utils/lodash-custom';

import rawQcmChallenge from '../data/challenges/raw-qcm-challenge';
import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQruChallengeFull from '../data/challenges/ref-qru-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';

export default function (schema, request) {

  const allChallenges = [
    rawQcmChallenge,
    refQcmChallengeFull,
    refQcuChallengeFull,
    refQruChallengeFull,
    refQrocChallengeFull,
    refQrocmChallengeFull
  ];

  const challenges = _.map(allChallenges, function (oneChallenge) {
    return { id: oneChallenge.data.id, obj: oneChallenge };
  });

  const challenge = _.find(challenges, { id: request.params.id });

  if (challenge) {
    return challenge.obj;
  } else {
    throw new Error('The challenge you required in the fake server does not exist ' + request.params.id);
  }

}
