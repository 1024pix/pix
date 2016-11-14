import qcuChallenge from '../data/challenges/qcu-challenge';
import qcmChallenge from '../data/challenges/qcm-challenge';
import qrocChallenge from '../data/challenges/qroc-challenge';
import qrocmChallenge from '../data/challenges/qrocm-challenge';

export default function () {

  return {
    data: [
      qcuChallenge.data,
      qcmChallenge.data,
      qrocChallenge.data,
      qrocmChallenge.data
    ]
  }

}
