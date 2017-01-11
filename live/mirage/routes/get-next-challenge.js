import rawQcmChallenge from '../data/challenges/raw-qcm-challenge';
import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQruChallengeFull from '../data/challenges/ref-qru-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import noFileChallenge from '../data/challenges/no-file-challenge';
import oneFileChallenge from '../data/challenges/one-file-challenge';
import multipleFilesChallenge from '../data/challenges/multiple-files-challenge';

export default function (schema, request) {

  // case 1 : we're trying to reach the first challenge for a given assessment
  if (!request.params.challengeId) {
    switch (request.params.assessmentId) {
      case 'raw_assessment_id':
        return rawQcmChallenge;
      case 'ref_assessment_id':
        return refQcmChallengeFull;
      default:
        throw new Error('This assessment is not defined ' + request.params.assessmentId);
    }
  }

  // case 2 : test already started, challenge exists.
  const nextChallenge = {
    // raw_course
    'raw_qcm_challenge_id': 'null',  // JSON should contain 'null', not null

    // ref_course
    'ref_qcm_challenge_id': refQcuChallengeFull,
    'ref_qcu_challenge_id': refQruChallengeFull,
    'ref_qru_challenge_id': refQrocChallengeFull,
    'ref_qroc_challenge_id': refQrocmChallengeFull,
    'ref_qrocm_challenge_id': noFileChallenge,
    'no_file_challenge_id': oneFileChallenge,
    'one_file_challenge_id': multipleFilesChallenge,
    'multiple_files_challenge_id': 'null'
  };

  const challenge = nextChallenge[request.params.challengeId];

  if (challenge) {
    return challenge;
  } else {
    throw new Error('There is no challenge following challenge ' + request.params.challengeId);
  }

}
