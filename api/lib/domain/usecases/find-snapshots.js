module.exports = function findSnapshots({ options, snapshotRepository }) {
  return snapshotRepository.find(options);
};
