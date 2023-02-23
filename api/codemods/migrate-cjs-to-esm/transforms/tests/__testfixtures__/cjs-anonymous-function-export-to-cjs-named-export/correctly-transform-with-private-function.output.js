const foo = function(
  {
    userId,
    userRepository,
  },
) {
  return _bar();
};

module.exports = {
  foo: foo,
};

function _bar() {
  return 'bar';
}
