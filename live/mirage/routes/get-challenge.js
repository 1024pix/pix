import _                                  from 'lodash/lodash';
import qcuChallengeAband                  from '../data/challenges/qcu-challenge-aband';
import qcuChallengeWithImage              from '../data/challenges/qcu-challenge-with-image';
import qcuChallengeWithAttachment         from '../data/challenges/qcu-challenge-with-attachment';
import qcuChallengeWithLinksInInstruction from '../data/challenges/qcu-challenge-with-links-in-instruction';
import qcuChallenge                       from '../data/challenges/qcu-challenge';
import qcmChallenge                       from '../data/challenges/qcm-challenge';
import qrocChallenge                      from '../data/challenges/qroc-challenge';
import qrocmChallenge                     from '../data/challenges/qrocm-challenge';

export default function (schema, request) {

  const allChallenges = [
    qcuChallengeAband,
    qcuChallengeWithImage,
    qcuChallengeWithAttachment,
    qcuChallengeWithLinksInInstruction,
    qcuChallenge,
    qcmChallenge,
    qrocChallenge,
    qrocmChallenge
  ];

  const challenges = _.map(allChallenges, function (oneChallenge) {
    return { id: oneChallenge.data.id, obj: oneChallenge }
  });

  const challenge = _.find(challenges, { id: request.params.id });

  if (challenge) {
    return challenge.obj;
  } else {
    throw new Error('The challenge you required in the fake server does not exist ' + request.params.id);
  }

}
