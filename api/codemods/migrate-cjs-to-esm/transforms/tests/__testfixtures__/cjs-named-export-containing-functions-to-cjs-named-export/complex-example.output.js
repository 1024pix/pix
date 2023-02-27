const foo = function() {
  return 'Hello world!';
};

const foo1 = function(arg1, arg2) {
  return 'Hello world!';
};

const foo2 = async function(
  {
    arg1,
    arg2,
  },
) {
  return 'Hello world!';
};

const foo3 = async function({ arg1, arg2 } = {}) {
  return 'Hello world!';
};

const foo4 = async function(
  arg1,
  {
    arg2,
    arg3,
  },
) {
  return 'Hello world!';
};

module.exports = {
  foo: foo,
  foo1: foo1,
  foo2: foo2,
  foo3: foo3,
  foo4: foo4,
};
