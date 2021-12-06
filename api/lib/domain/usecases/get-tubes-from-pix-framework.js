module.exports = function getTubes({ locale, tubeRepository }) {
  return tubeRepository.findActivesFromPixFramework(locale);
};
