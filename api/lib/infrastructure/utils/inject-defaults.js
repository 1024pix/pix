module.exports = function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
};
