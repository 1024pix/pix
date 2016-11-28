import _ from 'lodash/lodash';

export default function getChallengeType(challengeTypeFromAirtable) {
  let result = 'qcu'; // qcu by default, no error thrown

  let challengeType = challengeTypeFromAirtable.toUpperCase();

   if (_.contains(['QCUIMG', 'QCU', 'QRU'], challengeType)) {
     result = 'qcu';
   } else if (_.contains(['QCMIMG', 'QCM'], challengeType)) {
     result = 'qcm';
   } else if (_.contains(['QROC'], challengeType)) {
     result = 'qroc';
   } else if (_.contains(['QROCM'], challengeType)) {
     result = 'qrocm';
   }

  return result;
}
