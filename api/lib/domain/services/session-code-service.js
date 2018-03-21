const { sample } = require('lodash');
const sessionRepository = require('../../infrastructure/repositories/session-repository');

function _randomLetter() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sample(letters);
}

function _randomNumberCharacter() {
  const numberCharacter = '0123456789'.split('');
  return sample(numberCharacter);
}

function _generateSessionCode() {
  const code = '' +
    _randomLetter() +
    _randomLetter() +
    _randomLetter() +
    _randomLetter() +
    _randomNumberCharacter() +
    _randomNumberCharacter();
  return code;
}

module.exports = {

  getNewSessionCode() {

    return Promise.resolve(_generateSessionCode())

      .then((newSessionCode) => {

        return sessionRepository.isSessionCodeAvailable(newSessionCode).then((codeAvailable) => {
          if (codeAvailable) {
            return newSessionCode;
          } else {
            return this.getNewSessionCode();
          }
        });
      });
  },

  getSessionByAccessCode(codeToValidate) {
    return sessionRepository.getByAccessCode(codeToValidate);

  }
};
