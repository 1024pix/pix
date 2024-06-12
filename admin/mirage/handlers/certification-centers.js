function findPaginatedFilteredCertificationCenters(schema) {
  const certificationCenters = schema.certificationCenters.all().models;
  const json = this.serialize(
    { modelName: 'certification-center', models: certificationCenters },
    'certification-center',
  );
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

export { findPaginatedFilteredCertificationCenters };
