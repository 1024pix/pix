const dependencies = {
  userRepository: require('../../../infrastructure/scope-admin/repositories/user-repository'),
};

const { injectDependencies } = require('../../../infrastructure/utils/dependency-injection');

module.exports = injectDependencies(
  {
    addAdminRole: require('./add-admin-role'),
  },
  dependencies
);
