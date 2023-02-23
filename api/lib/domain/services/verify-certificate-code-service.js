const _ = require('lodash');
const certificationCourseRepository = require('../../../lib/infrastructure/repositories/certification-course-repository.js');
const { CertificateVerificationCodeGenerationTooManyTrials } = require('../../../lib/domain/errors.js');
const config = require('../../config.js');

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

module.exports = {
  async generateCertificateVerificationCode(generateCode = _generateCode) {
    for (let i = 0; i < NB_OF_TRIALS; i++) {
      const code = generateCode();
      const isCodeAvailable = await certificationCourseRepository.isVerificationCodeAvailable(code);
      if (isCodeAvailable) return code;
    }
    throw new CertificateVerificationCodeGenerationTooManyTrials(NB_OF_TRIALS);
  },
};
