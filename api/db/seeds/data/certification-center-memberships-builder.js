module.exports = function certificationCenterMembershipsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCenterMembership({
    id: 1,
    userId: 2,
    certificationCenterId: 1
  });

};
