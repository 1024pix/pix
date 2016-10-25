import qcuChallengeWithImage from '../data/challenges/qcu-challenge-with-image';
import qcuChallengeWithAttachment from '../data/challenges/qcu-challenge-with-attachment';
import qcuChallengeWithLinksInInstruction from '../data/challenges/qcu-challenge-with-links-in-instruction';
import qcuChallenge from '../data/challenges/qcu-challenge';
import qcmChallenge from '../data/challenges/qcm-challenge';
import qrocmChallenge from '../data/challenges/qrocm-challenge';

// eslint-disable-next-line complexity
export default function (schema, request) {

  switch (request.params.id) {

    case qcmChallenge.data.id:
      return qcmChallenge;
    case qcuChallenge.data.id:
      return qcuChallenge;
    case qrocmChallenge.data.id:
      return qrocmChallenge;
    case qcuChallengeWithImage.data.id:
      return qcuChallengeWithImage;
    case qcuChallengeWithAttachment.data.id:
      return qcuChallengeWithAttachment;
    case qcuChallengeWithLinksInInstruction.data.id:
      return qcuChallengeWithLinksInInstruction;
    default:
      return qcuChallenge;
  }

}
