function findFrameworkAreas(schema, request) {
  const id = request.params.id;
  return schema.frameworks.find(id).areas;
}

export { findFrameworkAreas };
