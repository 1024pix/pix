module.exports = {
  foo() {
    return 'Hello world!';
  },
  foo1(arg1, arg2) {
    return 'Hello world!';
  },
  async foo2({ arg1, arg2 }) {
    return 'Hello world!';
  },
  async foo3({ arg1, arg2 } = {}) {
    return 'Hello world!';
  },
  async foo4(arg1, { arg2, arg3 }) {
    return 'Hello world!';
  },
};
