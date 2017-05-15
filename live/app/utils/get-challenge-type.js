import _ from './lodash-custom';

export default function getChallengeType(challengeTypeFromAirtable) {
  let result = 'qcu'; // qcu by default, no error thrown
  const challengeType = challengeTypeFromAirtable.toUpperCase();

  if (_(challengeType).isAmongst(['QCUIMG', 'QCU', 'QRU'])) {
    result = 'qcu';
  } else if (_(challengeType).isAmongst(['QCMIMG', 'QCM'])) {
    result = 'qcm';
  } else if (_(challengeType).isAmongst(['QROC'])) {
    result = 'qroc';
  } else if (_(challengeType).isAmongst(['QROCM', 'QROCM-IND', 'QROCM-DEP'])) {
    result = 'qrocm';
  }

  return result;
}
