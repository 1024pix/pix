import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQruChallengeFull from '../data/challenges/ref-qru-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import refTimedChallengeFull from '../data/challenges/ref-timed-challenge';
import refTimedChallengeBisFull from '../data/challenges/ref-timed-challenge-bis';

export default function () {

  return {
    data: [
      refQcmChallengeFull.data,
      refQcuChallengeFull.data,
      refQruChallengeFull.data,
      refQrocChallengeFull.data,
      refQrocmChallengeFull.data,
      refTimedChallengeFull.data,
      refTimedChallengeBisFull.data
    ]
  };
}
