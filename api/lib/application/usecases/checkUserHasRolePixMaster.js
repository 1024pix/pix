const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {

  execute(userId) {
    return userRepository.isPixMaster(userId);
  }

};
