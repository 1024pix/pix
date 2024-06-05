function findPaginatedFilteredUsers(schema) {
  const users = schema.users.all().models;
  const json = this.serialize({ modelName: 'user', models: users }, 'user');
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

export { findPaginatedFilteredUsers };
