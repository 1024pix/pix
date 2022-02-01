export default function getChallengeType(challengeTypeFromAirtable) {
  let result = 'qcu'; // qcu by default, no error thrown
  const challengeType = challengeTypeFromAirtable.toUpperCase();

  if (['QCUIMG', 'QCU'].includes(challengeType)) {
    result = 'qcu';
  } else if (['QCMIMG', 'QCM'].includes(challengeType)) {
    result = 'qcm';
  } else if (['QROC'].includes(challengeType)) {
    result = 'qroc';
  } else if (['QROCM', 'QROCM-IND', 'QROCM-DEP'].includes(challengeType)) {
    result = 'qrocm';
  }

  return result;
}
