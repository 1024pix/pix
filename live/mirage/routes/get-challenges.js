import rawQcmChallenge from '../data/challenges/raw-qcm-challenge';
import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';

export default function () {

  return {
    data: [
      rawQcmChallenge,
      refQcmChallengeFull.data,
      refQcuChallengeFull.data,
      refQrocChallengeFull.data,
      refQrocmChallengeFull.data
    ]
  };

}
