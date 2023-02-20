import _ from 'lodash';
import verifyCertificationCodeService from '../../lib/domain/services/verify-certificate-code-service';
import verifyCertificateCodeRepository from '../../../../lib/infrastructure/repositories/verify-certificate-code-repository';

const addCertification = async () => {
  const code = await verifyCertificationCodeService.getNewVerifyCertificationCode();
  verifyCertificateCodeRepository.addCertification({ code, score: _.random(200, 600) });
};

// 'Generer 80 000 certificate & sur une heure essayer de trouver des couples code/score via brut force'
async function checkBrutForce() {
  const nbCertificates = 1;
  const length = 1000 * 60 * 1;
  const MIN_PIX = 200,
    MAX_PIX = 1200;

  console.time('certificats');
  console.timeLog('certificats', `\tCreation des ${nbCertificates} certicats`);
  await Promise.all(_.times(nbCertificates, addCertification));

  console.timeLog('certificats', `\tBrute force sur ${length / 60000} minutes`);
  const end = new Date().getTime() + length;
  let matches = 0,
    checks = 0;
  while (new Date().getTime() < end) {
    const code = await verifyCertificationCodeService.getNewVerifyCertificationCode();
    for (let i = MIN_PIX; i < MAX_PIX; i++) {
      const hasMatch = verifyCertificateCodeRepository.checkCertification({ code, score: i });
      if (hasMatch) {
        matches++;
        console.log('There is a matches for ', { code, score: i });
      }
      checks++;
    }
  }
  console.timeLog('certificats', checks, 'checks; found ', matches, `code/score pairs in ${length / 60000} minutes`);
}

checkBrutForce();
