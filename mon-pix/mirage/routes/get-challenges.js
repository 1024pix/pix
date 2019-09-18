import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import refTimedChallengeFull from '../data/challenges/ref-timed-challenge';
import refTimedChallengeBisFull from '../data/challenges/ref-timed-challenge-bis';
import refQcmChallengeNotYetAnswered from  '../data/challenges/ref-qcm-challenge-not-yet-answered';
import refQcuChallengeNotYetAnswered from  '../data/challenges/ref-qcu-challenge-not-yet-answered';
import refQrocChallengeNotYetAnswered from '../data/challenges/ref-qroc-challenge-not-yet-answered';
import refQrocmChallengeNotYetAnswered from '../data/challenges/ref-qrocm-challenge-not-yet-answered';

export default function() {
  return {
    data: [
      refQcmChallengeFull.data,
      refQcuChallengeFull.data,
      refQrocChallengeFull.data,
      refQrocmChallengeFull.data,
      refTimedChallengeFull.data,
      refTimedChallengeBisFull.data,
      refQcmChallengeNotYetAnswered.data,
      refQcuChallengeNotYetAnswered.data,
      refQrocChallengeNotYetAnswered.data,
      refQrocmChallengeNotYetAnswered.data,
    ]
  };
}
