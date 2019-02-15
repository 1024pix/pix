import { helper } from '@ember/component/helper';
import _ from 'mon-pix/utils/lodash-custom';

export function getChallengeComponentClass(params) {
  let result;
  const challenge = params[0];
  const challengeType = challenge.get('type').toUpperCase();

  if (_(challengeType).isAmongst(['QCUIMG', 'QCU'])) {
    result = 'qcu';
  } else if (_(challengeType).isAmongst(['QCMIMG', 'QCM'])) {
    result = 'qcm';
  } else if (_(challengeType).isAmongst(['QROC'])) {
    result = 'qroc';
  } else if (_(challengeType).isAmongst(['QROCM', 'QROCM-IND', 'QROCM-DEP'])) {
    result = 'qrocm';
  }

  return 'challenge-item-' + result;
}

export default helper(getChallengeComponentClass);
