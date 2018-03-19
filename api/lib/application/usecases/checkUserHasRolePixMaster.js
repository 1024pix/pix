const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {

  execute(userId) {
    return userRepository.get(userId)
      .then(user => user.hasRolePixMaster);
  }

};
