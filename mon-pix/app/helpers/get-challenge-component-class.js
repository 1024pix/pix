import { helper } from '@ember/component/helper';

export function getChallengeComponentClass(params) {
  let result;
  const challenge = params[0];
  const challengeType = challenge.get('type').toUpperCase();

  if (['QCUIMG', 'QCU'].includes(challengeType)) {
    result = 'qcu';
  } else if (['QCMIMG', 'QCM'].includes(challengeType)) {
    result = 'qcm';
  } else if (['QROC'].includes(challengeType)) {
    result = 'qroc';
  } else if (['QROCM', 'QROCM-IND', 'QROCM-DEP'].includes(challengeType)) {
    result = 'qrocm';
  }

  return 'challenge-item-' + result;
}

export default helper(getChallengeComponentClass);
