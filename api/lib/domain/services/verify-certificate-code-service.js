import _ from 'lodash';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import { CertificateVerificationCodeGenerationTooManyTrials } from '../../../lib/domain/errors.js';
import { config } from '../../config.js';

const availableCharacters =
  `${config.availableCharacterForCode.numbers}${config.availableCharacterForCode.letters}`.split('');
const NB_CHAR = 8;
const NB_OF_TRIALS = 1000;

function _generateCode() {
  return 'P-' + _.times(NB_CHAR, _randomCharacter).join('');
}

function _randomCharacter() {
  return _.sample(availableCharacters);
}

const generateCertificateVerificationCode = async function ({
  generateCode = _generateCode,
  dependencies = { certificationCourseRepository },
} = {}) {
  for (let i = 0; i < NB_OF_TRIALS; i++) {
    const code = generateCode();
    const isCodeAvailable = await dependencies.certificationCourseRepository.isVerificationCodeAvailable(code);
    if (isCodeAvailable) return code;
  }
  throw new CertificateVerificationCodeGenerationTooManyTrials(NB_OF_TRIALS);
};

export { generateCertificateVerificationCode };
