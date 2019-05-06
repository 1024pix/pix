module.exports = function certificationCentersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenter({
    id: 1,
    name: 'Tour Gamma',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: 2,
    name: 'Tour Epsilon',
  });

  databaseBuilder.factory.buildCertificationCenter({
    id: 3,
    name: 'Tour Nü',
  });
};
