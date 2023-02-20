export const a = function () {
  return "a";
};

export const b = function () {
  return "b";
};

const c = () => {
  return 42;
};
export { c };
export { c as d };
