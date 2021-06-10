const _ = require('lodash');
const sessionRepository = require('../../infrastructure/repositories/session-sql-repository');

function _randomLetter() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return _.sample(letters);
}

function _randomNumberCharacter() {
  const numberCharacter = '0123456789'.split('');
  return _.sample(numberCharacter);
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

  async getNewSessionCode() {
    const newSessionCode = _generateSessionCode();
    const codeAvailable = await sessionRepository.isSessionCodeAvailable(newSessionCode);
    return codeAvailable ? newSessionCode : this.getNewSessionCode();
  },
};
