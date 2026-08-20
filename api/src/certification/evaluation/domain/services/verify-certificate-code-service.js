import { config } from '../../../../shared/config.js';
import { CertificateVerificationCodeGenerationTooManyTrials } from '../../../../shared/domain/errors.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';

const availableCharacters = `${config.availableCharacterForCode.numbers}${config.availableCharacterForCode.letters}`
  .toUpperCase()
  .split('');
const NB_CHAR = 8;
const NB_OF_TRIALS = 1000;

function _generateCode() {
  const chars = Array.from(availableCharacters);
  for (let i = NB_CHAR; i >= 0; i--) {
    const j = Math.floor(Math.random() * (chars.length - 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return 'P-' + chars.slice(0, NB_CHAR).join('');
}

export async function generateCertificateVerificationCode({
  generateCode = _generateCode,
  dependencies = { certificationCourseRepository },
} = {}) {
  for (let i = 0; i < NB_OF_TRIALS; i++) {
    const verificationCode = generateCode();
    const isCodeAvailable = await dependencies.certificationCourseRepository.isVerificationCodeAvailable({
      verificationCode,
    });
    if (isCodeAvailable) return verificationCode;
  }
  throw new CertificateVerificationCodeGenerationTooManyTrials(NB_OF_TRIALS);
}
