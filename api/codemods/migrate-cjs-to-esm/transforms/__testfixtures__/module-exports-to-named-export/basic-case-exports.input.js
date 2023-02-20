exports.a = function () {
  return "a";
};
exports.b = function () {
  return "b";
};

const c = () => {
  return 42;
};
exports.c = c;
exports.d = c;
