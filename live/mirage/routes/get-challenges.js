import qcuChallenge from '../data/challenges/qcu-challenge';
import qcmChallenge from '../data/challenges/qcm-challenge';
import qrocmChallenge from '../data/challenges/qrocm-challenge';

export default function () {

  return {
    data: [
      qcuChallenge.data,
      qcmChallenge.data,
      qrocmChallenge.data
    ]
  }

}
