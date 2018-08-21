module.exports = function(plop) {

  plop.setGenerator('usecase', require('./plop/generators/usecase'));
  plop.setGenerator('adapter', require('./plop/generators/adaptor'));
};
