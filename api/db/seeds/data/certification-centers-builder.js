module.exports = function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: 1,
    name: 'Centre de certification Osiris',
  });
};
